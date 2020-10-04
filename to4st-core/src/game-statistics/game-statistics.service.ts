import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import _, { delay } from 'lodash';
import memoizee from 'memoizee';
import { clamp } from 'lodash';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, } from 'typeorm';
import pRetry from "p-retry";

import { Round } from './round.entity';
import { PlayerRoundStats } from './player-round-stats.entity';
import { PlayerRoundWeaponStats } from './player-round-weapon-stats.entity';
import { SteamUserService } from '../core/steam-user.service';
import { Gameserver } from '../gameserver/gameserver.entity';
import { ServerMap } from './server-map.entity';
import { GameMode } from './game-mode.entity';
import { MAX_PAGE_SIZE, MAX_PAGE_SIZE_WITH_STEAMID, TTL_CACHE_MS, CACHE_PREFETCH, PASSWORD_ALPHABET, MIN_ID_LENGTH } from '../globals';
import { Game } from './game.entity';
import { Weapon } from './weapon.entity';
import { mapDateForQuery, isValidSteamId, TIMEOUT_PROMISE_FACTORY } from '../shared/utils';
import { customAlphabet } from 'nanoid/async';

/**
 * Interface used to identify a round
 */
export interface IMapIdentifier {
    /**
     * Round id
     */
    id?: number, 

    /**
     * Map name
     */
    name?: string
}

/**
 * Interface used to identify a gameMode
 */
export interface IGameModeIdentifier {
    /**
     * GameMode id
     */
    id?: number, 

    /**
     * GameMode name
     */
    name?: string
}

/**
 * Interface used to query for gameModes
 */
export interface IGameModeQuery {
    /**
     * Desired page size
     */
    page?: number, 

    /**
     * Desired page size
     */
    pageSize?: number,
}

/**
 * Interface used to query rounds
 */
export interface IRoundQuery {
    /**
     * Desired page size
     */
    pageSize?: number, 

    /**
     * Desired page
     */
    page?: number, 

    /**
     * Rounds should be started after
     */
    startedAfter?: Date, 

    /**
     * Rounds should be started before
     */
    startedBefore?: Date, 

    /**
     *  Query for round of game
     */
    game?: Game, 

    /**
     * Filter for only finished rounds
     */
    onlyFinishedRounds?: boolean, 

    /**
     * Should be ordered descending?
     */
    orderDesc?: boolean

    /**
     * Only games which use a ranked match config
     */
    ranked?: boolean;
}

/**
 * Interface used to query games
 */
export interface IGameQuery {
    /**
     * Desired page size
     */
    pageSize?: number, 

    /**
     * Desired page
     */
    page?: number, 

    /**
     * Rounds should be started after
     */
    startedAfter?: Date, 

    /**
     * Rounds should be started before
     */
    startedBefore?: Date, 

    /**
     * Only retrieve games of gameServer
     */
    gameserver?: Gameserver, 

    /**
     * Filter for games on map
     */
    map?: ServerMap, 

    /**
     * Filter for games with gameMode
     */
    gameMode?: GameMode, 

    /**
     * Only include finished games
     */
    onlyFinishedGames?: boolean, 

    /**
     * Should be ordered descending?
     */
    orderDesc?: boolean

    /**
     * Only games which use a ranked match config
     */
    ranked?: boolean;
}

/**
 * Interface used to query round weapon statistics
 */
export interface IRoundWeaponStatisticsQuery 
{
    /**
     * For round
     */
    round?: Round, 

    /**
     * Desired page
     */
    page?: number, 

    /**
     * Desired page size
     */
    pageSize?: number, 
}

/**
 * Interface used to query round statistics
 */
export interface IRoundStatisticsQuery {
    /**
     * For round
     */
    round?: Round, 

    /**
     * Desired page
     */
    page?: number, 

    /**
     * Desired page size
     */
    pageSize?: number, 
}

/**
 * Interface used to query gameMode
 */
export interface IGameModeQuery {
    /**
     * Desired page
     */
    page?: number, 

    /**
     * Desired page size
     */
    pageSize?: number,
}

/**
 * Service for basic game statistics
 */
@Injectable()
export class GameStatisticsService {

    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>, 
        @InjectRepository(PlayerRoundStats) private readonly playerRoundStatsRepository: Repository<PlayerRoundStats>,
        @InjectRepository(GameMode) private readonly gameModeRepository: Repository<GameMode>, 
        @InjectRepository(ServerMap) private readonly mapRepository: Repository<ServerMap>, 
        @InjectRepository(Game) private readonly gameRepository: Repository<Game>, 
        @InjectRepository(Weapon) private readonly weaponRepository: Repository<Weapon>, 
        @InjectRepository(PlayerRoundWeaponStats) private readonly playerRoundWeaponStatsRepository: Repository<PlayerRoundWeaponStats>, 
        @InjectConnection() private readonly connection: Connection,
        private readonly steamUserService: SteamUserService
        )
    {
    }

    /**
     * Cache used for weapons
     */
    private weaponIdCache = new Map<string, number>();

    /**
     * Cache used for gameModes
     */
    private gameModeIdCache = new Map<string, number>();

    /**
     * Cache for maps
     */
    private mapIdCache = new Map<string, number>();

    /**
     * memoized number of rounds played
     */
    private _cachedNumberOfRoundsPlayed = memoizee(async () => (await this.getRounds({onlyFinishedRounds: true}))[1], {promise: true, maxAge: TTL_CACHE_MS, preFetch: CACHE_PREFETCH });

    /**
     * memoized number of games played
     */
    private _cachedNumberOfGamesPlayed = memoizee(async () => (await this.getGames({pageSize: 1, onlyFinishedGames: true}))[1], {promise: true, maxAge: TTL_CACHE_MS, preFetch: CACHE_PREFETCH });

    /**
     * Create or update game
     * Cascades included gameMode and map
     * @param game 
     */
    async createUpdateGame(game: Game): Promise<Game | null>
    {
        game = new Game({...game});

        if(!game.id)
        {
            game.id = await customAlphabet(PASSWORD_ALPHABET, MIN_ID_LENGTH)();
        }

        game.gameserver = new Gameserver({id: game.gameserver.id});
        
        if(game.gameMode && !game.gameMode.id)
        {
            game.gameMode.id = this.gameModeIdCache.get(game.gameMode.name);
        }

        if(game.map && !game.map.id)
        {
            game.map.id = this.mapIdCache.get(game.map.name);
        }

        if(game.gameMode && !game.gameMode.id)
        {
            await pRetry(async () => {
                    await this.connection.transaction("SERIALIZABLE", async manager => 
                    {
                        const found = await manager.findOne(GameMode, {name: game.gameMode.name});
                        if(found)
                        {
                            game.gameMode.id = found.id;
                            this.gameModeIdCache.set(game.gameMode.name, found.id);
                        }
                        else
                        {
                            const inserted = await manager.save(GameMode, new GameMode({name: game.gameMode.name, isTeamBased: game.gameMode.isTeamBased}));
                            this.gameModeIdCache.set(game.gameMode.name, inserted.id);
                            game.gameMode.id = inserted.id;
                        }
                    });
                }, {retries: 6, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }

        if(game.map && !game.map.id)
        { 
            await pRetry(async () => {
                await this.connection.transaction("SERIALIZABLE", async manager => 
                {
                    if(!game.map.id)
                    {
                        const found = await manager.findOne(ServerMap, {name: game.map.name});
                        if(found)
                        {
                            game.map.id = found.id;
                            this.mapIdCache.set(game.map.name, found.id);
                        }
                        else
                        {
                            const inserted = await manager.save(ServerMap, new ServerMap({name: game.map.name}));
                            this.mapIdCache.set(game.map.name, inserted.id);
                            game.map.id = inserted.id;
                        }
                    }
                });
                }, {retries: 6, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }

        const inserted = await this.gameRepository.save(game);

        return inserted ? await this.getGame(inserted.id): null;
    }

    /**
     * Get Map
     * @param options 
     */
    async getMap(options: IMapIdentifier): Promise<ServerMap | undefined>
    {
        return await this.mapRepository.findOne({where: !!options.id ? {id: options.id} : {name: options.name}});
    }

    /**
     * Get game mode
     * @param options 
     */
    async getGameMode(options: IGameModeIdentifier): Promise<GameMode | undefined>
    {
        return await this.gameModeRepository.findOne({where: !!options.id  ? {id: options.id} : {name: options.name}});
    }

    /**
     * Get gameModes
     * @param options 
     * @returns Array of gameModes, total count, page count
     */
    async getGameModes(options: IGameModeQuery): Promise<[GameMode[], number, number]>
    {
        options.pageSize = options.pageSize ?? MAX_PAGE_SIZE;
        options.page = options.page ?? 1;
        const [found, count] = await this.gameModeRepository.findAndCount(
            {
                take: options.pageSize,
                skip: options.pageSize * (options.page - 1),
                order: {name: "ASC"}
        });
        return  [found, count, Math.ceil(count / options.pageSize)];
    }

    /**
     * Get Game
     * @param id 
     */
    async getGame(id: string): Promise<Game | undefined>
    {
        return await this.gameRepository.findOne({where: {id: id}, relations: ["gameserver", "map", "gameMode", "matchConfig"]});
    }

    /**
     * Delete games
     * @param games 
     */
    async deleteGames(games: Partial<Game>[])
    {
        const chunked = _.chunk(games.map(x => new Game({id: x.id})), 200).map(chunk => this.gameRepository.remove(chunk));
        await Promise.all(chunked);
    }

    /**
     * Delete rounds
     * @param rounds 
     */
    async deleteRounds(games: Partial<Round>[])
    {
        const chunked = _.chunk(games.map(x => new Round({id: x.id})), 200).map(chunk => this.roundRepository.remove(chunk));
        await Promise.all(chunked);
    }

    /**
     * Create or update round
     * @param round 
     */
    async createUpdateRound(round: Round)
    {
        const clone = new Round({...round});

        clone.game = new Game({id: round.game.id});
        const inserted = await this.roundRepository.save(clone);
        return await this.getRound(inserted.id);
    }

    /**
     * Get round
     * @param id 
     */
    async getRound(id: number): Promise<Round | undefined>
    {
        return await this.roundRepository.findOne({where: {id: id}, relations: ["game", "game.map", "game.gameMode", "game.gameserver", "game.matchConfig"]});
    }

    /**
     * Create or update playerRoundStats
     * @param stats 
     * @throws if any steamId64 is not valid
     */
    async createUpdatePlayerRoundStats(stats: PlayerRoundStats[])
    {
        const toInsert = stats.map(x => {
            const cloned = new PlayerRoundStats({...x});
            cloned.round = new Round({id: x.round.id})

            cloned.kills = Math.max(cloned.kills, 0);
            cloned.deaths = Math.max(cloned.deaths, 0);
            cloned.suicides = Math.max(cloned.suicides, 0);
            cloned.score = Math.max(cloned.score, 0);
            cloned.totalDamage = Math.max(cloned.totalDamage, 0);

            cloned.round = new Round({id: x.round.id});
            return cloned;
        });

        toInsert.forEach(x => {
            if(!isValidSteamId(x.steamId64))    
            {
                throw new HttpException(`Invalid SteamId64: ${x.steamId64}`, HttpStatus.BAD_REQUEST);
            }        
        });

        await this.steamUserService.updateSteamUsers(toInsert.map(x => x.steamId64)); // Don't update when weapon stats are set, this should be enough since update round / weapon stats are usually used at the same time

        const chunked = _.chunk(toInsert, 175).map(chunk => this.playerRoundStatsRepository.save(chunk));
        await Promise.all(chunked);
    }

    /**
     * Create or update playerRoundWeaponStats
     * Cascades weapon
     * @param weaponStats 
     * @throws if any steamId64 is not valid
     */
    async createUpdatePlayerRoundWeaponStats(weaponStats: PlayerRoundWeaponStats[])
    {
        const toInsert = weaponStats.map(x => {
            const cloned = new PlayerRoundWeaponStats({...x});

            cloned.totalDamage = Math.max(cloned.totalDamage, 0);
            cloned.shotsHead = Math.max(cloned.shotsHead, 0);
            cloned.shotsArms = Math.max(cloned.shotsArms, 0);
            cloned.shotsChest = Math.max(cloned.shotsChest, 0);
            cloned.shotsLegs = Math.max(cloned.shotsLegs, 0);
            cloned.shotsFired = Math.max(cloned.shotsFired, 0);

            cloned.round = new Round({id: x.round.id})
            return cloned;
        });

        toInsert.forEach(x => {
            if(!isValidSteamId(x.steamId64))    
            {
                throw new HttpException(`Invalid SteamId64: ${x.steamId64}`, HttpStatus.BAD_REQUEST);
            }        
        });
        
        const uniqWeapons = _.uniqBy(toInsert.map(x => x.weapon).filter(x => !x.id && !this.weaponIdCache.has(x.name)), "name");

        if(uniqWeapons.length > 0)
        {
            const weapons = await this.weaponRepository.find({where: uniqWeapons.map(x => ({name: x.name}))});
            weapons.forEach(x => this.weaponIdCache.set(x.name, x.id));
        }

        const uniqWeaponsNew = _.uniqBy(toInsert.map(x => x.weapon).filter(x => !x.id && !this.weaponIdCache.has(x.name)), "name");

        if(uniqWeaponsNew.length > 0)
        {
            await pRetry(async () => {
                await this.connection.transaction("SERIALIZABLE", async manager => 
                {      
                    const weapons = await manager.find(Weapon, {where: uniqWeaponsNew.map(x => ({name: x.name}))});
                
                    weapons.forEach(x => {
                    this.weaponIdCache.set(x.name, x.id);
                    });
                    
                    const newWeapons = uniqWeaponsNew.filter(x => !this.weaponIdCache.has(x.name));
                    if(newWeapons.length > 0)
                    {
                        const savedWeapons = await manager.save(Weapon, newWeapons);
        
                        savedWeapons.forEach(x => {
                            this.weaponIdCache.set(x.name, x.id);
                        });
            
                    }
                });
                }, {retries: 6, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }

        toInsert.forEach(x => {
            if(!x.weapon.id)
            {
                x.weapon.id = this.weaponIdCache.get(x.weapon.name);
            }
        });
            
        const chunked = _.chunk(toInsert, 150).map(chunk => this.playerRoundWeaponStatsRepository.save(chunk));

        await Promise.all(chunked);

       
    }

    /**
     * Get number of rounds played on this backend
     */
    async getNumberOfRoundsCached(): Promise<number>
    {
        return await this._cachedNumberOfRoundsPlayed();
    }

    /**
     * Get rounds
     * @param options 
     * @returns Array of rounds, total count, page count
     */
    async getRounds(options: IRoundQuery): Promise<[Round[], number, number]>
    {
        options.page = Math.max(1, options.page ?? 1);
        options.pageSize = clamp(options.pageSize ?? MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE)
        options.onlyFinishedRounds = options.onlyFinishedRounds ?? true;

        let queryBuilder = this.connection.createQueryBuilder().select("round").from(Round, "round");

        queryBuilder = queryBuilder.leftJoinAndSelect("round.game", "game");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.gameMode", "gameMode");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.map", "map");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.gameserver", "gameserver");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.matchConfig", "matchConfig");

        queryBuilder = queryBuilder.where("1=1");  

        if(options.game)
        {
            queryBuilder = queryBuilder.andWhere("game.id = :gameId", { gameId: options.game.id });
        }

        if(options.ranked)
        {
            queryBuilder = queryBuilder.andWhere("matchConfig.ranked = :isranked", { isranked: options.ranked });
        }

        if(options.onlyFinishedRounds)
        {
            queryBuilder = queryBuilder.andWhere("round.endedAt IS NOT NULL");
        }

        if(options.startedBefore)
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt <= :bef", {bef: mapDateForQuery(options.startedBefore)});
        }

        if(options.startedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("round.startedAt >= :af", {af: mapDateForQuery(options.startedAfter)});
        }

        
        queryBuilder = queryBuilder.skip(options.pageSize * (options.page - 1)).take(options.pageSize);

        queryBuilder = queryBuilder.orderBy("round.startedAt", options.orderDesc ? "DESC" : "ASC");


        const ret = await queryBuilder.getManyAndCount(); 
        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }

    /**
     * Get number of rounds games on this backend
     */
    async getNumberOfGamesCached(): Promise<number>
    {
        return await this._cachedNumberOfGamesPlayed();
    }

    /**
     * Get games
     * @param options 
     * @returns Array of games, total count, page count
     */
    async getGames(options: IGameQuery): Promise<[Game[], number, number]>
    {
        options.page = Math.max(1, options.page ?? 1);
        options.pageSize = clamp(options.pageSize ?? MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE);
        options.onlyFinishedGames = options.onlyFinishedGames ?? true;

        let queryBuilder = this.connection.createQueryBuilder().select("game").from(Game, "game");

        queryBuilder = queryBuilder.leftJoinAndSelect("game.gameserver", "gameserver");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.map", "map");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.gameMode", "gameMode");
        queryBuilder = queryBuilder.leftJoinAndSelect("game.matchConfig", "matchConfig");

        queryBuilder = queryBuilder.where("1=1"); 
    
        if(options.ranked)
        {
            queryBuilder = queryBuilder.andWhere("matchConfig.ranked = :isranked", { isranked: options.ranked });
        }

        if(options.gameMode)
        {
            queryBuilder = queryBuilder.andWhere(options.gameMode.id ? "gameMode.id = :gameModeId" : "gameMode.name = :gameModeName" , options.gameMode.id ? { gameModeId: options.gameMode.id } : { gameModeName: options.gameMode.name });
        }

        if(options.map)
        {
            queryBuilder = queryBuilder.andWhere(options.map.id ? "map.id = :mapId" : "map.name = :mapName" , options.map.id ? { mapId: options.map.id } : { mapName: options.map.name });
        }

        if(options.gameserver)
        {
            queryBuilder = queryBuilder.andWhere("gameserver.id = :gameServerId", { gameServerId: options.gameserver.id });
        }

        if(options.onlyFinishedGames)
        {
            queryBuilder = queryBuilder.andWhere("game.endedAt IS NOT NULL");
        }

        if(options.startedBefore)
        {
            queryBuilder = queryBuilder.andWhere("game.startedAt <= :bef", {bef: mapDateForQuery(options.startedBefore)});
        }

        if(options.startedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("game.startedAt >= :af", {af: mapDateForQuery(options.startedAfter)});
        }

        
        queryBuilder = queryBuilder.skip(options.pageSize * (options.page - 1)).take(options.pageSize);

        queryBuilder = queryBuilder.orderBy("game.startedAt", options.orderDesc ? "DESC" : "ASC");

        const ret = await queryBuilder.getManyAndCount();

            
        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }

    /**
     * Get round weapon stats
     * @param options 
     * @returns Array of playerRoundWeaponStats, total count, page count
     */
    async getRoundWeaponStatistics(options: IRoundWeaponStatisticsQuery): Promise<[PlayerRoundWeaponStats[], number, number]>
    {
        options.page = Math.max(1, options.page ?? 1);
        options.pageSize = clamp(options.pageSize ?? MAX_PAGE_SIZE_WITH_STEAMID, 1, MAX_PAGE_SIZE_WITH_STEAMID)
        
        const ret = await this.playerRoundWeaponStatsRepository.findAndCount(
            {
                where: options.round ? {
                    round: options.round
                } : undefined, 
                take: options.pageSize, 
                skip: options.pageSize * (options.page - 1),
                order: {round: "DESC"},
                relations: ["weapon"]
            });
                

        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }

    /**
     * Get round statistics
     * @param options 
     * @returns Array of playerRoundStats, total count, page count
     */
    async getRoundStatistics(options: IRoundStatisticsQuery): Promise<[PlayerRoundStats[], number, number]>
    {
        options.page = Math.max(1, options.page ?? 1);
        const maxPageSize = MAX_PAGE_SIZE_WITH_STEAMID;
        options.pageSize = clamp(options.pageSize ?? maxPageSize, 1, maxPageSize)

        const ret = await this.playerRoundStatsRepository.findAndCount(
            {
                where: options.round ? {
                    round: options.round
                } : undefined, 
                take: options.pageSize, 
                order: {round: "DESC"},
                skip: options.pageSize * (options.page - 1),
            });
                

        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }

    
}
