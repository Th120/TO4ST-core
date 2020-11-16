import { Injectable, } from '@nestjs/common';
import { InjectRepository, InjectConnection, } from '@nestjs/typeorm';
import { Repository, Connection, } from 'typeorm';
import _ from 'lodash';
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
import { accountIdToSteamId64, steamId64ToAccountId, mapDateForQuery } from '../shared/utils';
import { PlayerStatistics, OrderPlayerBaseStats } from './player-statistics';
import { PlayerWeaponStatistics } from './player-weapon-statistics';


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
}

/**
 * Service used to get aggregated player statistics
 */
@Injectable()
export class AggregatedGameStatisticsService {

    constructor(
        @InjectRepository(PlayerRoundStats) private readonly playerRoundStatsRepository: Repository<PlayerRoundStats>,
        @InjectRepository(PlayerRoundWeaponStats) private readonly playerRoundWeaponStatsRepository: Repository<PlayerRoundWeaponStats>, 
        @InjectConnection() private readonly connection: Connection,
        private readonly configService: ConfigService
        )
    {
    }

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

        const [query, params] = queryBuilder.getQueryAndParameters();

        const rank = `ROW_NUMBER() OVER (ORDER BY groupedraw.${options.orderBy ?? "sumkills"} ${options.orderDesc ? "DESC" : "ASC"}, groupedraw.sumscore ${options.orderDesc ? "DESC" : "ASC"}, groupedraw.sumdamage ${options.orderDesc ? "DESC" : "ASC"}) as playerrank`;
        const pagination = `ranked.playerrank > ${(options.page - 1) * options.pageSize} AND ranked.playerrank <= ${(options.page) * options.pageSize}`;
        const where = `${pagination} ${options.steamId64 ? ` AND ranked.steamid64 = ${steamId64ToAccountId(options.steamId64)}` : ""}`
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
           const [result, numPlayers] = await Promise.all([em.query(withRanks, params), this.getCountUniquePlayers(options)]);
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

        let queryBuilder = this.playerRoundStatsRepository.createQueryBuilder("playerRoundStats");

        queryBuilder = queryBuilder.leftJoin("playerRoundStats.round", "round");
                
        queryBuilder = queryBuilder.leftJoin("round.game", "game");
        queryBuilder = queryBuilder.leftJoin("game.matchConfig", "matchConfig");
        
        if(options.gameMode)
        {
            queryBuilder = queryBuilder.leftJoin("game.gameMode", "gameMode")
        }
        
        queryBuilder = queryBuilder.select("count(distinct playerRoundStats.steamId64) as total");

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

        if(options.ranked)
        {
            queryBuilder = queryBuilder.andWhere("matchConfig.ranked = :isranked", { isranked: options.ranked });
        }

        if(options.round?.id)
        {
            queryBuilder = queryBuilder.andWhere("round.id = :roundId" , { roundId: options.round.id });
        }

        if(options.startedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt <= :bef", {bef: mapDateForQuery(options.startedBefore)});
        }

        if(options.startedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt >= :af", {af: mapDateForQuery(options.startedAfter)});
        }

        if(options.endedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt <= :bef", {bef: mapDateForQuery(options.endedBefore)});
        }

        if(options.endedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt >= :af", {af: mapDateForQuery(options.endedAfter)});
        }


        const ret = await queryBuilder.getRawOne();

        return parseInt(ret?.total ?? 0);
    }
    
}
