import { Injectable, Logger, OnApplicationBootstrap, } from '@nestjs/common';
import { InjectRepository, InjectConnection, } from '@nestjs/typeorm';
import { Repository, Connection, } from 'typeorm';
import _, { orderBy } from 'lodash';
import { clamp } from 'lodash';
import memoizee from 'memoizee';
import { ConfigService } from '@nestjs/config';


import { Game } from './game.entity';
import { Round } from './round.entity';
import { PlayerRoundStats } from './player-round-stats.entity';
import { PlayerRoundWeaponStats } from './player-round-weapon-stats.entity';
import { GameMode } from './game-mode.entity';
import { MAX_PAGE_SIZE_WITH_STEAMID, TTL_CACHE_MS, CACHE_PREFETCH } from '../globals';
import { Weapon } from './weapon.entity';
import { accountIdToSteamId64, steamId64ToAccountId, mapDateForQuery, TIMEOUT_PROMISE_FACTORY } from '../shared/utils';
import { PlayerStatistics, OrderPlayerBaseStats, escapeOrderBy } from './player-statistics';
import { PlayerWeaponStatistics } from './player-weapon-statistics';
import moment from 'moment';
import { AppConfigService } from '../core/app-config.service';


/**
 * Interface used to query aggregated player statistics
 */
export interface IAggregatedPlayerStatisticsQuery {
    /**
     * Desired page size
     */
    pageSize?: number, 

    /**
     * Desired page
     */
    page?: number, 

    /**
     * Filter for certain player by steamId64
     */
    steamId64?: string, 

    /**
     * Only get stats from rounds which were started after date
     */
    startedAfter?: Date, 

    /**
     * Only get stats from rounds which were started before date
     */
    startedBefore?: Date, 

    /**
     * Only get stats from rounds which were ended after date
     */
    endedAfter?: Date, 

    /**
     * Only get stats from rounds which were ended before date
     */
    endedBefore?: Date, 

    /**
     * Order stats by field
     */
    orderBy?: OrderPlayerBaseStats, 

    /**
     * Filter matches of gameMode
     */
    gameMode?: GameMode, 

    /**
     * Filter stats of round
     */
    round?: Round, 

    /**
     * Filter stats of match
     */
    game?: Game, 

    /**
     * Filter for only finished rounds
     */
    onlyFinishedRounds?: boolean, 
    
    /**
     * Only games which use a ranked match config
     */
    ranked?: boolean;

    /**
     * Should be ordered descending?
     */
    orderDesc?: boolean

    /**
     * Get simple cached if possible
     */
    cached?: boolean

    /**
     * Override pagiation, never use within a resolver!
     */
    overridePagination?: boolean
}

/**
 * Interface used to query weapon statistics of player
 */
export interface IAggregatedWeaponStatisticsQuery {
    /**
     * Player steamId64
     */
    steamId64: string,

    /**
     * Only get stats from rounds which were started after date
     */
    startedAfter?: Date, 

    /**
     * Only get stats from rounds which were ended after date
     */
    startedBefore?: Date, 

    /**
     * Only get stats from rounds which were ended after date
     */
    endedAfter?: Date, 

    /**
     * Only get stats from rounds which were ended before date
     */
    endedBefore?: Date, 

    /**
     * Filter stats of round
     */
    round?: Round, 

    /**
     * Filter stats of match
     */
    game?: Game, 

    /**
     * Filter matches of gameMode
     */
    gameMode?: GameMode, 

    /**
     * Only games which use a ranked match config
     */
    ranked?: boolean;

    /**
     * Filter for only finished rounds
     */
    onlyFinishedRounds?: boolean
}

/**
 * Interface used to query player count
 */
export interface IPlayerCountQuery {
    /**
     * Only get stats from rounds which were started after date
     */
    startedAfter?: Date, 

    /**
     * Only get stats from rounds which were ended after date
     */
    startedBefore?: Date, 

    /**
     * Only get stats from rounds which were ended after date
     */
    endedAfter?: Date, 

    /**
     * Only get stats from rounds which were ended before date
     */
    endedBefore?: Date, 

    /**
     * Filter stats of round
     */
    round?: Round, 

    /**
     * Filter stats of match
     */
    game?: Game, 

    /**
     * Filter matches of gameMode
     */
    gameMode?: GameMode, 

    /**
     * Only games which use a ranked match config
     */
    ranked?: boolean;

    /**
     * Filter for only finished rounds
     */
    onlyFinishedRounds?: boolean

    /**
     * Min total score required to be counted
     */
    minTotalScore?: number;
}

/**
 * Delay to attempt cache update if caching is disabled, will only update if setting is enabled
 */
const NO_CACHE_RETRY = 60 * 1000;

/**
 * Service used to get aggregated player statistics
 */
@Injectable()
export class AggregatedGameStatisticsService implements OnApplicationBootstrap {

    constructor(
        @InjectRepository(PlayerRoundStats) private readonly playerRoundStatsRepository: Repository<PlayerRoundStats>,
        @InjectRepository(PlayerRoundWeaponStats) private readonly playerRoundWeaponStatsRepository: Repository<PlayerRoundWeaponStats>, 
        @InjectConnection() private readonly connection: Connection,
        private readonly configService: ConfigService,
        private readonly appConfigService: AppConfigService,
        )
    {
    }

    


    /**
     * Cache used for player stats 
     */
    private playerStatsCache: Map<OrderPlayerBaseStats, {asc: PlayerStatistics[], desc: PlayerStatistics[]}> = null;


    /**
     * Interval of cache update
     */
    private cacheInterval: NodeJS.Timeout;

    /**
     * Cache used for unique player count
     */
    private _cachedCountUniquePlayers = memoizee(async () => await this.getCountUniquePlayers({}), {promise: true, maxAge: TTL_CACHE_MS, preFetch: CACHE_PREFETCH});

    /**
     * Getter for unique player count
     */
    async getCountUniquePlayersCached()
    {
        return await this._cachedCountUniquePlayers();
    }

    /* istanbul ignore next */
    public onApplicationBootstrap()
    {
        if(process.env.NODE_ENV !== "test") // makes no sense during tests
        {
            this.updateCacheLoop();
        }
    }

    /**
     * Sets up infinite cache update cycle
     * Starts next interval after update is finished 
     */
    /* istanbul ignore next */
    private async updateCacheLoop()
    {
        let delay = 0;
        try
        {
            const appCfg = await this.appConfigService.getAppConfig(true);
            delay = appCfg.playerStatsCacheAge * 60 * 1000;
        }
        catch(e)
        {

        }

        if(delay > 0)
        {
            try
            {
                await this.updateCachedStats();
            }
            catch (e)
            {
                this.playerStatsCache = null;
                Logger.error(e);
            }
        }
        else
        {
            this.playerStatsCache = null;
        }
      
    
        this.cacheInterval = setTimeout(async () => {
            this.updateCacheLoop();
        }, !!this.playerStatsCache ? delay : NO_CACHE_RETRY);
    }
        
    /**
     * Update player stats cache
     */
    async updateCachedStats()
    {
        const before = moment.utc().subtract(5, "seconds").toDate();

        Logger.log("Generating PlayerStats cache for games before: " + before.toString(), "PlayerStats cache", true);

        const [res, total] = await this.getPlayerStatistics({orderBy: OrderPlayerBaseStats.sumKills, ranked: true, orderDesc: true, endedBefore: before, overridePagination: true});

        Logger.log("Finished database query", "PlayerStats cache", true);

        const orderByMap = new Map<OrderPlayerBaseStats, {asc: PlayerStatistics[], desc: PlayerStatistics[]}>([
            [OrderPlayerBaseStats.sumKills, { asc: res.reverse(), desc: res} ],
            [OrderPlayerBaseStats.sumDeaths, null],
            [OrderPlayerBaseStats.sumScore, null],
            [OrderPlayerBaseStats.sumDamage, null],
            [OrderPlayerBaseStats.killDeath, null],
            [OrderPlayerBaseStats.sumSuicides, null],
            [OrderPlayerBaseStats.averageDamagePerRound, null],
            [OrderPlayerBaseStats.averageScorePerRound, null ],
            [OrderPlayerBaseStats.roundsPlayed, null],
            [OrderPlayerBaseStats.gamesPlayed, null],
        ]);

        Logger.log(`Begin sorting`, "PlayerStats cache", true);
    
        for (let stats of orderByMap)
        {
            if(stats[0] === OrderPlayerBaseStats.sumKills)
            {
                continue;
            }

            const sorted = res.sort((x, y) => {
                switch (stats[0])
                {
                    case OrderPlayerBaseStats.sumDeaths:
                        return y.deaths - x.deaths;
                    case OrderPlayerBaseStats.sumScore:
                        return y.totalScore - x.totalScore;
                    case OrderPlayerBaseStats.sumDamage:
                        return y.totalDamage - x.totalDamage;
                    case OrderPlayerBaseStats.killDeath:
                        return y.killDeathRatio - x.killDeathRatio;
                    case OrderPlayerBaseStats.sumSuicides:
                        return y.suicides - x.suicides;
                    case OrderPlayerBaseStats.averageDamagePerRound:
                        return y.avgDamagePerRound - x.avgDamagePerRound;
                    case OrderPlayerBaseStats.averageScorePerRound:
                        return y.avgScorePerRound - x.avgScorePerRound;
                    case OrderPlayerBaseStats.roundsPlayed:
                        return y.numberRoundsPlayed - x.numberRoundsPlayed;
                    case OrderPlayerBaseStats.gamesPlayed:
                        return y.numberGamesPlayed - x.numberGamesPlayed;
                }
                    
               return y.avgDamagePerRound - x.avgDamagePerRound
            });

            orderByMap.set(stats[0], {
                asc: sorted.reverse(), 
                desc: sorted
            });
            await TIMEOUT_PROMISE_FACTORY(0.2, 0.3)[0]; // lazy
        }

        this.playerStatsCache = orderByMap;

        Logger.log(`Done, Cache has ${orderByMap.size * total * 2} entries.`, "PlayerStats cache", true);
    }
    
    /**
     * Get cached player stats
     * @param page 
     * @param pageSize 
     * @param orderBy 
     * @param orderDesc 
     */
    private getCachedPlayerStatistics(page: number, pageSize: number, orderBy: OrderPlayerBaseStats, orderDesc: boolean, overridePagination: boolean): [PlayerStatistics[], number, number]
    {
        const stats = this.playerStatsCache.get(orderBy);
        const res = orderDesc ? stats.desc: stats.asc;
        return [overridePagination ? res : res.slice((page - 1) * pageSize, page * pageSize), res.length, Math.ceil(res.length / pageSize)];
    }

    /**
     * Get player statistics
     * @param options 
     * @returns Array of player statistics, total count, page count
     */
    async getPlayerStatistics(options: IAggregatedPlayerStatisticsQuery): Promise<[PlayerStatistics[], number, number]>
    {
        options.onlyFinishedRounds = options.onlyFinishedRounds ?? true;

        options.page = Math.max(1, options.page ?? 1);
        options.pageSize = clamp(options.pageSize ?? MAX_PAGE_SIZE_WITH_STEAMID, 1, MAX_PAGE_SIZE_WITH_STEAMID)
        options.orderDesc = options.orderDesc ?? true;
        options.orderBy = options.orderBy ? escapeOrderBy(options.orderBy) : OrderPlayerBaseStats.sumKills;
        options.ranked = options.ranked ?? false;

        if(!!options.cached 
            && !!this.playerStatsCache 
            && !options.steamId64 
            && !options.endedAfter 
            && !options.endedBefore
            && !options.startedAfter 
            && !options.startedBefore
            && !options.round
            && !options.gameMode
            && !options.game
            && options.ranked
            && options.onlyFinishedRounds
            )
        {
            return this.getCachedPlayerStatistics(options.page, options.pageSize, options.orderBy, options.orderDesc, options.overridePagination);
        }
        
        let queryBuilder = this.playerRoundStatsRepository.createQueryBuilder("prs");

        queryBuilder = queryBuilder.leftJoin("prs.round", "round");
        queryBuilder = queryBuilder.leftJoin("round.game", "game");
        queryBuilder = queryBuilder.leftJoin("game.gameMode", "gameMode")
        queryBuilder = queryBuilder.leftJoin("game.matchConfig", "matchConfig");

        // #ORM Hate.
        let greatest = "GREATEST"
        if(this.configService.get<string>("database.type") === "sqlite")
        {
            greatest = "MAX";
        }

        queryBuilder = queryBuilder.select(`prs.steamId64 as steamid64, SUM(prs.kills) as sumkills, SUM(prs.deaths) as sumdeaths, (SUM(kills) / ${greatest}(1.0, (1.0 * SUM(deaths) + SUM(suicides)))) as killdeath, SUM(prs.suicides) as sumsuicides, SUM(prs.totalDamage) as sumdamage, SUM(prs.score) as sumscore, (SUM(prs.totalDamage) / ${greatest}(1.0, (1.0 * count(*)))) as averagedamageperround, (SUM(prs.score) / ${greatest}(1.0, (1.0 * count(*)))) as averagescoreperround, count(*) as roundsplayed, count(distinct round.game) as gamesplayed`);
       
        queryBuilder = queryBuilder.where("1=1"); 

        if(options.ranked)
        {
            queryBuilder = queryBuilder.andWhere("matchConfig.ranked = :isranked", { isranked: options.ranked });
        }
    
        if(options.onlyFinishedRounds)
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt IS NOT NULL");
        }

        if(options.gameMode)
        {
            queryBuilder = queryBuilder.andWhere(options.gameMode.id ? "gameMode.id = :gameModeId" : "gameMode.name = :gameModeName" , options.gameMode.id ? { gameModeId: options.gameMode.id } : { gameModeName: options.gameMode.name });
        }

        if(options.game?.id)
        {
            queryBuilder = queryBuilder.andWhere("game.id = :gameId" , { gameId: options.game.id });
        }

        if(options.round?.id)
        {
            queryBuilder = queryBuilder.andWhere("round.id = :roundId" , { roundId: options.round.id });
        }

        if(options.startedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt <= :stabef", {stabef: mapDateForQuery(options.startedBefore)});
        }

        if(options.startedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt >= :staaf", {staaf: mapDateForQuery(options.startedAfter)});
        }

        if(options.endedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt <= :endbef", {endbef: mapDateForQuery(options.endedBefore)});
        }

        if(options.endedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt >= :endaf", {endaf: mapDateForQuery(options.endedAfter)});
        }

        queryBuilder = queryBuilder.groupBy("prs.steamId64");

        const appCfg = await this.appConfigService.getAppConfig(true);

        if(appCfg.minScoreStats > 0)
        {
            queryBuilder = queryBuilder.having("SUM(prs.score) > :scoreHigher", {scoreHigher: appCfg.minScoreStats})
        }

        const [query, params] = queryBuilder.getQueryAndParameters();

        const rank = `ROW_NUMBER() OVER (ORDER BY groupedraw.${options.orderBy ?? "sumkills"} ${options.orderDesc ? "DESC" : "ASC"}, groupedraw.sumscore ${options.orderDesc ? "DESC" : "ASC"}, groupedraw.sumdamage ${options.orderDesc ? "DESC" : "ASC"}) as playerrank`;
        const pagination = `ranked.playerrank > ${(options.page - 1) * options.pageSize} AND ranked.playerrank <= ${(options.page) * options.pageSize}`;

        const where = `${!options.overridePagination ? pagination : "1=1"} ${options.steamId64 ? `AND ranked.steamid64 = ${steamId64ToAccountId(options.steamId64)}` : ""}`;
        const withRanks = `SELECT * FROM (SELECT groupedraw.steamid64, ${rank}, groupedraw.sumkills, groupedraw.sumdeaths, groupedraw.sumsuicides, groupedraw.sumdamage, groupedraw.sumscore, groupedraw.roundsplayed, groupedraw.gamesplayed, groupedraw.killdeath, groupedraw.averagedamageperround, groupedraw.averagescoreperround FROM (${query}) as groupedraw) as ranked WHERE ${where}`;

        const em = this.connection.createEntityManager();

        let ret: any[] = [];
        let count = 0;

        if(options.steamId64)
        {
            ret = await em.query(withRanks, params);
        }
        else
        {
           const [result, numPlayers] = await Promise.all([em.query(withRanks, params), this.getCountUniquePlayers({...options, minTotalScore: appCfg.minScoreStats})]);
           ret = result;
           count = numPlayers;
        }

        const mappedResult = ret.map(x => (
            {
                steamId64: accountIdToSteamId64(parseInt(x.steamid64)), 
                rank: parseInt(x.playerrank),
                kills: parseInt(x.sumkills), 
                deaths: parseInt(x.sumdeaths),
                suicides: parseInt(x.sumsuicides),
                totalDamage: parseFloat(x.sumdamage),
                totalScore: parseInt(x.sumscore),
                numberRoundsPlayed: parseInt(x.roundsplayed),
                numberGamesPlayed: parseInt(x.gamesplayed),
                killDeathRatio: parseFloat(x.killdeath),
                avgDamagePerRound: parseFloat(x.averagedamageperround),
                avgScorePerRound: parseFloat(x.averagescoreperround),
            } as PlayerStatistics));


        const total = count === 0 ? mappedResult.length : count;

        return [mappedResult, total, Math.ceil(total / options.pageSize)];
    }

    /**
     * Get weapon statistics of player
     * @param options 
     * @returns Array of weapon statistics
     */
    async getPlayerWeaponStatistics(options: IAggregatedWeaponStatisticsQuery): Promise<PlayerWeaponStatistics[]>
    {
        options.onlyFinishedRounds = options.onlyFinishedRounds ?? true;

        let queryBuilder = this.connection.createQueryBuilder();

        queryBuilder = queryBuilder.select("ws.sumdamage as sumdamage, ws.sumshotshead as sumshotshead, ws.sumshotschest as sumshotschest, ws.sumshotsarms as sumshotsarms, ws.sumshotslegs as sumshotslegs, ws.sumshotsfired as sumshotsfired, weap.name as weapname, weap.weaponType as weaptype")

        queryBuilder.from(subq => {
            subq = subq.select("prws.weapon as weaponid, SUM(prws.totalDamage) as sumdamage, SUM(prws.shotsHead) as sumshotshead, SUM(prws.shotsChest) as sumshotschest, SUM(prws.shotsArms) as sumshotsarms, SUM(prws.shotsLegs) as sumshotslegs, SUM(prws.shotsFired) as sumshotsfired")
            .from(PlayerRoundWeaponStats, "prws");

            subq = subq.leftJoin("prws.round", "round");
            subq = subq.leftJoin("round.game", "game");
            subq = subq.leftJoin("game.gameMode", "gameMode")
            subq = subq.leftJoin("game.matchConfig", "matchConfig");

            subq = subq.groupBy("prws.weapon");

            subq = subq.where("prws.steamId64 = :steamId", {steamId: steamId64ToAccountId(options.steamId64)});

            if(options.onlyFinishedRounds)
            {
                subq = subq.andWhere("round.endedAt IS NOT NULL");
            }

            if(options.gameMode)
            {
                subq = subq.andWhere(options.gameMode.id ? "gameMode.id = :gameModeId" : "gameMode.name = :gameModeName" , options.gameMode.id ? { gameModeId: options.gameMode.id } : { gameModeName: options.gameMode.name });
            }

            if(options.game?.id)
            {
                subq = subq.andWhere("game.id = :gameId" , { gameId: options.game.id });
            }

            if(options.ranked)
            {
                subq = subq.andWhere("matchConfig.ranked = :isranked", { isranked: options.ranked });
            }

            if(options.round?.id)
            {
                subq = subq.andWhere("round.id = :roundId" , { roundId: options.round.id });
            }

            if(options.startedBefore)
            {
                subq = subq.andWhere("round.startedAt <= :bef", {bef: mapDateForQuery(options.startedBefore)});
            }
    
            if(options.startedAfter) 
            {
                subq = subq.andWhere("round.startedAt >= :af", {af: mapDateForQuery(options.startedAfter)});
            }
    
            if(options.endedBefore)
            {
                subq = subq.andWhere("round.endedAt <= :bef", {bef: mapDateForQuery(options.endedBefore)});
            }
    
            if(options.endedAfter) 
            {
                subq = subq.andWhere("round.endedAt >= :af", {af: mapDateForQuery(options.endedAfter)});
            }

            return subq;
        }, "ws");

        queryBuilder = queryBuilder.leftJoin(Weapon, "weap", "weap.id = ws.weaponid");
      
        const ret = await queryBuilder.getRawMany();

        const mappedResult = ret.map(x => (
            {
                steamId64: options.steamId64, 
                totalDamage: parseFloat(x.sumdamage),
                totalShots: parseInt(x.sumshotsfired), 
                shotsHead: parseInt(x.sumshotshead),
                shotsArms: parseInt(x.sumshotsarms),
                shotsChest: parseInt(x.sumshotschest),
                shotsLegs: parseInt(x.sumshotslegs),
                weapon: new Weapon({name: x.weapname, weaponType: x.weaptype}),

            } as PlayerWeaponStatistics));
        

        return mappedResult;
        
    }

    /**
     * Get count of players
     * @param options 
     */
    async getCountUniquePlayers(options: IPlayerCountQuery): Promise<number>
    {
        options.onlyFinishedRounds = options.onlyFinishedRounds ?? true;
        options.minTotalScore = options.minTotalScore ?? 0;
        
        let queryBuilder = this.playerRoundStatsRepository.createQueryBuilder("prs");

        queryBuilder = queryBuilder.leftJoin("prs.round", "round");
        queryBuilder = queryBuilder.leftJoin("round.game", "game");
        queryBuilder = queryBuilder.leftJoin("game.gameMode", "gameMode")
        queryBuilder = queryBuilder.leftJoin("game.matchConfig", "matchConfig");

        queryBuilder = queryBuilder.select(`SUM(prs.score) as sumscore`);
       
        queryBuilder = queryBuilder.where("1=1"); 

        if(options.ranked)
        {
            queryBuilder = queryBuilder.andWhere("matchConfig.ranked = :isranked", { isranked: options.ranked });
        }
    
        if(options.onlyFinishedRounds)
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt IS NOT NULL");
        }

        if(options.gameMode)
        {
            queryBuilder = queryBuilder.andWhere(options.gameMode.id ? "gameMode.id = :gameModeId" : "gameMode.name = :gameModeName" , options.gameMode.id ? { gameModeId: options.gameMode.id } : { gameModeName: options.gameMode.name });
        }

        if(options.game?.id)
        {
            queryBuilder = queryBuilder.andWhere("game.id = :gameId" , { gameId: options.game.id });
        }

        if(options.round?.id)
        {
            queryBuilder = queryBuilder.andWhere("round.id = :roundId" , { roundId: options.round.id });
        }

        if(options.startedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt <= :stabef", {stabef: mapDateForQuery(options.startedBefore)});
        }

        if(options.startedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt >= :staaf", {staaf: mapDateForQuery(options.startedAfter)});
        }

        if(options.endedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt <= :endbef", {endbef: mapDateForQuery(options.endedBefore)});
        }

        if(options.endedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt >= :endaf", {endaf: mapDateForQuery(options.endedAfter)});
        }

        queryBuilder = queryBuilder.groupBy("prs.steamId64");


        if(options.minTotalScore > 0)
        {
            queryBuilder = queryBuilder.having("SUM(prs.score) > :scoreHigher", {scoreHigher: options.minTotalScore})
        }

        const [query, params] = queryBuilder.getQueryAndParameters();

        const em = this.connection.createEntityManager();

        const countQuery = `select count(*) as total from (${query}) as groupedraw`;

        const ret = await em.query(countQuery, params);

        return parseInt(ret[0]?.total ?? 0);
    }
    
}
