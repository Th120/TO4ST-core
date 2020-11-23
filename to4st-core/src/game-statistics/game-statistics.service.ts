import { Injectable, HttpException, HttpStatus, OnApplicationBootstrap } from '@nestjs/common';
import _, { delay } from 'lodash';
import memoizee from 'memoizee';
import { clamp } from 'lodash';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, EntityManager, } from 'typeorm';
import pRetry from "p-retry";

import { Round } from './round.entity';
import { PlayerRoundStats } from './player-round-stats.entity';
import { PlayerRoundWeaponStats } from './player-round-weapon-stats.entity';
import { SteamUserService } from '../core/steam-user.service';
import { Gameserver } from '../gameserver/gameserver.entity';
import { ServerMap } from './server-map.entity';
import { GameMode } from './game-mode.entity';
import { MAX_PAGE_SIZE, MAX_PAGE_SIZE_WITH_STEAMID, TTL_CACHE_MS, CACHE_PREFETCH, PASSWORD_ALPHABET, MIN_ID_LENGTH, MAX_RETRIES } from '../globals';
import { Game } from './game.entity';
import { Weapon } from './weapon.entity';
import { mapDateForQuery, isValidSteamId, TIMEOUT_PROMISE_FACTORY, asyncForEach } from '../shared/utils';
import { customAlphabet } from 'nanoid/async';
import { GameserverConfig } from '../gameserver/gameserver-config.entity';
import { MatchConfig } from '../gameserver/match-config.entity';


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
     * Games should have started after
     */
    startedAfter?: Date, 

    /**
     * Games should have ended after
     */
    endedAfter?: Date, 

    /**
     * Games should have started before
     */
    startedBefore?: Date, 

    /**
     * Games should have ended before
     */
    endedBefore?: Date,

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
    orderDesc?: boolean,

    /**
     * Should be ordered by end date?
     */
    orderByEndedAt?: boolean,

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

    /**
     * Allows easy query via field resolver
     * Should not be exposed to all auth levels
     */
    overridePageSize?: boolean;
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

    /**
     * Allows easy query via field resolver
     * Should not be exposed to all auth levels
     */
    overridePageSize?: boolean;
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



export const DEFAULT_GAMEMODES = [
    new GameMode({name: "Classic", isTeamBased: true}),
    new GameMode({name: "Capture the Flag", isTeamBased: true}),
    new GameMode({name: "Team Deathmatch", isTeamBased: true}),
  ];



/**
 * Service for basic game statistics
 */
@Injectable()
export class GameStatisticsService implements OnApplicationBootstrap {

    constructor(
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>, 
        @InjectRepository(PlayerRoundStats) private readonly playerRoundStatsRepository: Repository<PlayerRoundStats>,
        @InjectRepository(GameMode) private readonly gameModeRepository: Repository<GameMode>, 
        @InjectRepository(ServerMap) private readonly mapRepository: Repository<ServerMap>, 
        @InjectRepository(Game) private readonly gameRepository: Repository<Game>, 
        @InjectRepository(Weapon) private readonly weaponRepository: Repository<Weapon>, 
        @InjectRepository(PlayerRoundWeaponStats) private readonly playerRoundWeaponStatsRepository: Repository<PlayerRoundWeaponStats>, 
        @InjectConnection() private readonly connection: Connection,
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
     * Nestjs lifecycle event
     */
    async onApplicationBootstrap()
    {
        await asyncForEach(DEFAULT_GAMEMODES, async (elem) => {
            await this.createUpdateGameMode(elem);
        });
    }

    /**
     * Create or update a gameMode
     * @param gameMode 
     * @param manager which is used only (!) for transactions (optional, must use SERIALIZABLE due to name being a unique index)
     */
    async createUpdateGameMode(gameMode: GameMode, manager?: EntityManager): Promise<GameMode>
    {
        let ret: GameMode  = null;

        gameMode = {...gameMode};

        if(!gameMode.id)
        {
            gameMode.id = this.gameModeIdCache.get(gameMode.name);
        }
        
        // actual saving function that is used; no need for a private function
        const saveGameMode = async (man) => {
            
            if(!gameMode.id)
            {
                const found = await man.findOne(GameMode, {where: {name: gameMode.name.trim()}});
                if(found)
                {
                    gameMode.id = found.id;
                }
            }
            
            const saved = await man.save(GameMode, new GameMode(
                {
                    id: gameMode.id || undefined, //get rid of null if it exists for whatever reason
                    name: gameMode.name.trim(), 
                    isTeamBased: gameMode.isTeamBased
                }
            ));

            return await man.findOne(GameMode, {id: saved.id});
        };
        
        //No need for a transaction in that case; ensure that manager is not overwritten when this method is used within a transaction
        //Maybe it was kinda stupid not not use the gamemode's name as primary key, but whatever, maybe it saves a few kb of db space :D
        if(gameMode.id && !manager)
        {
            manager = this.connection.createEntityManager();
        }

        if(manager)
        {
            ret = await saveGameMode(manager);
        }
        else // only executed if manager is not set when the method is called AND if the gamemode has no id field
        {
            await pRetry(async () => {
                    await this.connection.transaction("SERIALIZABLE", async manager => 
                    {
                        ret = await saveGameMode(manager);
                    });
                }, {retries: MAX_RETRIES, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }

        this.gameModeIdCache.set(ret.name, ret.id);

        return ret;
    }    

    /**
     * Create or update a serverMap entity
     * @param map 
     * @param manager which is used only (!) for transactions (optional, must use SERIALIZABLE due to name being a unique index)
     */
    async createUpdateServerMap(map: ServerMap, manager?: EntityManager): Promise<ServerMap>
    {
        let ret: ServerMap  = null;

        map = {...map};

        if(!map.id)
        {
            map.id = this.mapIdCache.get(map.name);
        }
        
        // actual saving function that is used; no need for a private function
        const saveServerMap = async (man: EntityManager) => {
            
            if(!map.id)
            {
                const found = await man.findOne(ServerMap, {where: {name: map.name.trim()}});
                if(found)
                {
                    map.id = found.id;
                }
            }
            
            const saved = await man.save(ServerMap, new ServerMap(
                {
                    id: map.id || undefined, //get rid of null if it exists for whatever reason
                    name: map.name.trim(), 
                }
            ));

            return await man.findOne(ServerMap, {id: saved.id});
        };
        
        //No need for a transaction in that case; ensure that manager is not overwritten when this method is used within a transaction
        //Maybe it was kinda stupid not not use the map's name as primary key, but whatever, maybe it saves a few kb of db space :D
        if(map.id && !manager)
        {
            manager = this.connection.createEntityManager();
        }

        if(manager)
        {
            ret = await saveServerMap(manager);
        }
        else // only executed if manager is not set when the method is called AND if the gamemode has no id field
        {
            await pRetry(async () => {
                    await this.connection.transaction("SERIALIZABLE", async manager => 
                    {
                        ret = await saveServerMap(manager);
                    });
                }, {retries: MAX_RETRIES, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }

        this.mapIdCache.set(ret.name, ret.id);

        return ret;
    }    

    /**
     * Create or update game
     * Cascades included gameMode and map
     * @param game 
     * @param manager which is used only (!) for transactions (optional)
     */
    async createUpdateGame(game: Game, manager?: EntityManager): Promise<Game>
    {
        game = new Game({...game});

        if(game.map)
        {
            game.map = new ServerMap({...game.map});
        }
        if(game.gameMode)
        {
            game.gameMode = new GameMode({...game.gameMode});
        }
        if(game.gameserver)
        {
            game.gameserver = new Gameserver({id: game.gameserver.id});
        }

        if(!manager)
        {
            manager = this.connection.createEntityManager();
        }

        if(!game.id)
        {
            game.id = await customAlphabet(PASSWORD_ALPHABET, MIN_ID_LENGTH)();
        }

        // need id for insert
        // try to get ids from cache first
        if(game.gameMode && !game.gameMode.id)
        {
            game.gameMode.id = this.gameModeIdCache.get(game.gameMode.name);
        }
        if(game.map && !game.map.id)
        {
            game.map.id = this.mapIdCache.get(game.map.name);
        }


        // get id from db, create entity if it does not exist right now
        if(game.gameMode && !game.gameMode.id)
        {
            const inserted = await this.createUpdateGameMode(game.gameMode, manager);
            game.gameMode.id = inserted.id;
        }
        if(game.map && !game.map.id)
        { 
            const inserted = await this.createUpdateServerMap(game.map, manager);
            game.map.id = inserted.id;
        }

        const inserted = await manager.save(Game, game);

        return await manager.findOne(Game, {where: {id: inserted.id}, relations: ["gameserver", "map", "gameMode", "matchConfig", "matchConfig.gameMode"]});
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
        return await this.gameModeRepository.findOne({where: !!options.id  ? {id: options.id} : {name: options.name.trim()}});
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
        return await this.gameRepository.findOne({where: {id: id}, relations: ["gameserver", "map", "gameMode", "matchConfig", "matchConfig.gameMode"]});
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
     * @param manager which is used only (!) for transactions (optional)
     */
    async createUpdateRound(round: Round, manager?: EntityManager)
    {
        if(!manager)
        {
            manager = this.connection.createEntityManager();
        }

        const clone = new Round({...round});

        clone.game = new Game({id: round.game.id});
        const inserted = await manager.save(Round, clone);
        return await manager.findOne(Round, {where: {id: inserted.id}, relations: ["game", "game.map", "game.gameMode", "game.gameserver", "game.matchConfig"]});
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
     * @param manager which is used only (!) for transactions (optional)
     * @throws if any steamId64 is not valid
     */
    async createUpdatePlayerRoundStats(stats: PlayerRoundStats[], manager?: EntityManager)
    {
        const toInsert = stats.map(x => {
            const cloned = new PlayerRoundStats({...x});
            cloned.round = new Round({id: x.round.id})

            cloned.kills = Math.max(cloned.kills, 0);
            cloned.deaths = Math.max(cloned.deaths, 0);
            cloned.suicides = Math.max(cloned.suicides, 0);
            cloned.score = Math.max(cloned.score, 0);
            cloned.totalDamage = Math.max(cloned.totalDamage, 0);

            return cloned;
        });

        toInsert.forEach(x => {
            if(!isValidSteamId(x.steamId64))    
            {
                throw new HttpException(`Invalid SteamId64: ${x.steamId64}`, HttpStatus.BAD_REQUEST);
            }        
        });

        if(manager)
        {
            const chunked = _.chunk(toInsert, 175).map(chunk => manager.save(PlayerRoundStats, chunk)); //chunk to avoid sqlite issues
            await Promise.all(chunked);
        }
        else
        {
            await pRetry(async () => {
                    await this.connection.transaction("READ UNCOMMITTED", async manager => 
                    {
                        const chunked = _.chunk(toInsert, 175).map(chunk => manager.save(PlayerRoundStats, chunk)); //chunk to avoid sqlite issues
                        await Promise.all(chunked);
                    });
                }, {retries: MAX_RETRIES, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }

        
    }

    /**
     * Create or update playerRoundWeaponStats
     * Cascades weapon
     * @param weaponStats 
     * @param manager which is used only (!) for transactions (optional)
     * @throws if any steamId64 is not valid
     */
    async createUpdatePlayerRoundWeaponStats(weaponStats: PlayerRoundWeaponStats[], manager?: EntityManager)
    {
        const weapons = weaponStats.map(x => x.weapon);

        await this.insertWeaponsSetCachedId(weapons, manager);

        const toInsert = weaponStats.map(x => {
            const cloned = new PlayerRoundWeaponStats({...x});

            cloned.totalDamage = Math.max(cloned.totalDamage, 0);
            cloned.shotsHead = Math.max(cloned.shotsHead, 0);
            cloned.shotsArms = Math.max(cloned.shotsArms, 0);
            cloned.shotsChest = Math.max(cloned.shotsChest, 0);
            cloned.shotsLegs = Math.max(cloned.shotsLegs, 0);
            cloned.shotsFired = Math.max(cloned.shotsFired, 0);

            cloned.weapon = new Weapon({id: this.weaponIdCache.get(cloned.weapon.name)});
            cloned.round = new Round({id: x.round.id})
            return cloned;
        });

        toInsert.forEach(x => {
            if(!isValidSteamId(x.steamId64))    
            {
                throw new HttpException(`Invalid SteamId64: ${x.steamId64}`, HttpStatus.BAD_REQUEST);
            }
            else if(!x.weapon?.id)    
            {
                throw new HttpException(`Could not retrieve id for weapon: <${x.weapon}>`, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });


        if(manager)
        {
            const chunked = _.chunk(toInsert, 150).map(chunk => manager.save(PlayerRoundWeaponStats, chunk)); //chunk to avoid sqlite issues
            await Promise.all(chunked);
        }
        else
        {
            await pRetry(async () => {
                    await this.connection.transaction("READ UNCOMMITTED", async manager => 
                    {
                        const chunked = _.chunk(toInsert, 150).map(chunk => manager.save(PlayerRoundWeaponStats, chunk)); //chunk to avoid sqlite issues
                        await Promise.all(chunked);
                    });
                }, {retries: MAX_RETRIES, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
            );
        }
           
    }

    /**
     * Inserts weapon into database and set ids in cache (needed for player round weapon stats)
     * Does not deal with updating entity (if needed it has to be done later, but not while inserting player weapon stats)
     * @param weapons
     * @param manager which is used only (!) for transactions (optional, must use SERIALIZABLE due to name being a unique index)
     */
    async insertWeaponsSetCachedId(weapons: Weapon[], manager?: EntityManager)
    {
        // Only consider weapons which don't have an id set or id set inside cache to further processed
        const uniqWeapons = _.uniqBy(weapons.filter(x => !x.id && !this.weaponIdCache.has(x.name)), "name").map(x => ({...x}));

        if(uniqWeapons.length > 0)
        {
            // Only save weapons which do not exist in database yet and set ids in cache for all weapons
            const insertSetId = async (manager: EntityManager) => {
                const foundWeapons = await manager.find(Weapon, {where: uniqWeapons.map(x => ({name: x.name}))});
                    
                foundWeapons.forEach(x => {
                    this.weaponIdCache.set(x.name, x.id);
                });
                
                const newWeapons = uniqWeapons.filter(x => !this.weaponIdCache.has(x.name));
                if(newWeapons.length > 0)
                {
                    const savedWeapons = await manager.save(Weapon, newWeapons);

                    savedWeapons.forEach(x => {
                        this.weaponIdCache.set(x.name, x.id);
                    });
        
                }
            };

            if(manager)
            {
                await insertSetId(manager);
            }
            else
            {
                await pRetry(async () => {
                    await this.connection.transaction("SERIALIZABLE", async manager => 
                    {      
                        await insertSetId(manager);
                    });
                    }, {retries: MAX_RETRIES, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0]}
                );
            }
        }
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
        queryBuilder = queryBuilder.leftJoinAndSelect("matchConfig.gameMode", "matchConfigGameMode");

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
            queryBuilder = queryBuilder.andWhere("game.startedAt <= :sbef", {sbef: mapDateForQuery(options.startedBefore)});
        }

        if(options.startedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("game.startedAt >= :saf", {saf: mapDateForQuery(options.startedAfter)});
        }

        if(options.endedAfter) 
        {
            queryBuilder = queryBuilder.andWhere("game.endedAt >= :eaf", {eaf: mapDateForQuery(options.endedAfter)});
        }

        if(options.endedBefore)
        {
            queryBuilder = queryBuilder.andWhere("game.endeddAt <= :ebef", {ebef: mapDateForQuery(options.endedBefore)});
        }

        
        queryBuilder = queryBuilder.skip(options.pageSize * (options.page - 1)).take(options.pageSize);

        queryBuilder = queryBuilder.orderBy(!options.orderByEndedAt ? "game.startedAt" : "game.endedAt", options.orderDesc ? "DESC" : "ASC");

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
                take: !options.overridePageSize ? options.pageSize : undefined, 
                skip: !options.overridePageSize ? options.pageSize * (options.page - 1) : undefined,
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
                take: !options.overridePageSize ? options.pageSize : undefined, 
                order: {round: "DESC"},
                skip: !options.overridePageSize ? options.pageSize * (options.page - 1) : undefined,
            });
                

        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }

    
}
