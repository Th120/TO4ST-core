import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import _ from "lodash"
import { Repository, Connection, Like, Brackets } from 'typeorm';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import jsSHA from "jssha";
import pRetry from "p-retry";

import { Gameserver } from './gameserver.entity';
import { MAX_PAGE_SIZE } from '../globals';
import { GameserverConfig } from './gameserver-config.entity';
import { MatchConfig } from './match-config.entity';
import { TIMEOUT_PROMISE_FACTORY } from '../shared/utils';
import { Game } from '../game-statistics/game.entity';

/**
 * Interface used to identify a gameserver
 */
export interface IMatchConfigIdentifier {
  /**
   * Name of the configuration preset
   */
  configName?: string, 

  /**
   * Id of config preset
   */
  id?: number
}

/**
 * Interface used to query gameservers
 */
export interface IGameserverConfigsQuery {
  /**
   * Desired page
   */
  page?: number, 

  /**
   * Desired page size
   */
  pageSize?: number, 

  /**
   * Search gameserver id, gameserver name, match config name
   */
  search?: string, 

  /**
   * Should order by gameserver name?
   */
  orderByGameserverName?: boolean, 

  /**
   * Should order desc by matchConfigName?
   */
  orderDesc?: boolean
}

/**
 * Interface used to query match configuration presets
 */
export interface IMatchConfigsQuery {
  /**
   * Desired page
   */
  page?: number, 

  /**
   * Name of a configuration preset
   */
  configName?: string, 

  /**
   * Desired page size
   */
  pageSize?: number, 

  /**
   * Should order desc by config preset name?
   */
  orderDesc?: boolean
}

/**
 * Service used to set configs for gameservers
 */
@Injectable()
export class GameserverConfigService {
    constructor(
        @InjectRepository(MatchConfig) private readonly matchConfigRepository: Repository<MatchConfig>, 
        @InjectRepository(GameserverConfig) private readonly gameserverConfigRepository: Repository<GameserverConfig>, 
        @InjectConnection() private readonly connection: Connection,
        )
    {
    }

  /**
   * Get gameserver config for gameserver
   * @param gameserver 
   */
  async getGameserverConfig(gameserver: Partial<Gameserver>)
  {
    return await this.gameserverConfigRepository.findOne({relations: ["gameserver", "currentMatchConfig"], where: {gameserver: {id: gameserver.id}}});
  }

  /**
   * Get gameserver configs 
   * @param gameserver 
   */
  async getGameserverConfigs(options: IGameserverConfigsQuery): Promise<[GameserverConfig[], number, number]>
  {
    options.orderDesc = options.orderDesc ?? false;
    options.pageSize = options.pageSize ?? MAX_PAGE_SIZE;
    options.page = options.page ?? 1;
    options.orderByGameserverName = options.orderByGameserverName ?? false;
    options.search = options.search?.trim() ?? "";

    let queryBuilder = this.connection.createQueryBuilder().select("gameserverConfig").from(GameserverConfig, "gameserverConfig");

    queryBuilder = queryBuilder.leftJoinAndSelect("gameserverConfig.gameserver", "gameserver");
    queryBuilder = queryBuilder.leftJoinAndSelect("gameserverConfig.matchConfig", "matchConfig");

    queryBuilder = queryBuilder.where("1=1"); 

    if(options.search)
    {
      queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
        qb.orWhere("gameserver.id like :search", {search: `%${options.search}%`})
          .orWhere("gameserver.currentName like :search", {search: `%${options.search}%`})
          .orWhere("matchConfig.configName like :search", {search: `%${options.search}%`})
      }));
    }
    
    queryBuilder = queryBuilder.skip(options.pageSize * (options.page - 1)).take(options.pageSize);

    queryBuilder = queryBuilder.orderBy(options.orderByGameserverName ? "matchConfig.configName" : "gameserver.currentName", options.orderDesc ? "DESC" : "ASC");

    const ret = await queryBuilder.getManyAndCount();

    return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
  }

  /**
   * 
   * order: options.orderByGameserverName ? {
            gameserver: {
              name: options.orderDesc ? "DESC" : "ASC"
            }
          } : 
          {
            currentMatchConfig: {
              configName: options.orderDesc ? "DESC" : "ASC"
            }
          },
   */

  /**
   * Delete gameserver config
   * @param options 
   */
  async deleteGameserverConfig(gameserver: Partial<Gameserver>): Promise<void>
  {
      await this.connection
      .createQueryBuilder()
      .delete()
      .from(GameserverConfig)
      .where("gameserver.id = :id" ,  { id: gameserver.id })
      .execute();
  }

  /**
   * Create or update gameserver configuration
   * @param gameserverConfig 
   */
  async createUpdateGameserverConfig(gameserverConfig: GameserverConfig): Promise<GameserverConfig>
  {
    gameserverConfig = {...gameserverConfig};
    gameserverConfig.gameserver = new Gameserver({id: gameserverConfig.gameserver.id});

    if(!gameserverConfig.currentMatchConfig?.id && !(await this.getGameserverConfig(gameserverConfig.gameserver)))
    {
      throw new HttpException("Gameserver config must be initialized with default match config.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    else if(gameserverConfig.currentMatchConfig?.id)
    {
      gameserverConfig.currentMatchConfig = new MatchConfig({id: gameserverConfig.currentMatchConfig.id});
    }

    let ret = null;

    await pRetry(async () => {
      await this.connection.transaction("SERIALIZABLE", async manager => 
      {   
        const foundMatchConfig = await manager.findOne(MatchConfig, {where: {id: gameserverConfig.currentMatchConfig.id}});

        const passwordSet = gameserverConfig.gamePassword?.trim() || (await manager.findOne(GameserverConfig, {where: {gameserver: gameserverConfig.gameserver }}))?.gamePassword?.trim(); 

        if((foundMatchConfig.private || gameserverConfig.reservedSlots > 0) && !passwordSet)
        {
          throw new pRetry.AbortError(new HttpException("A private match or reserved slots require a gameserver password", HttpStatus.INTERNAL_SERVER_ERROR));
        }
        else if(!passwordSet) // the server does not need to handle a password in that case
        {
          gameserverConfig.gamePassword = "";
        }

        const inserted = await manager.save(GameserverConfig, gameserverConfig);

        ret = await manager.findOne(GameserverConfig, {
          where: {
            gameserver: inserted.gameserver
          }, 
          relations: ["gameserver", "currentMatchConfig"]
        });

      }), 
      { retries: 6, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0] }
    });

    return ret;
  }

  /**
   * Get single match config
   * @param options 
   */
  async getMatchConfig(options: IMatchConfigIdentifier)
  {
    return await this.matchConfigRepository.findOne({where: options.id ? {id: options.id} : {configName: options.configName}});
  }

  /**
   * Create / update match config
   * A config can't be edited if it is referenced by a game and the changed variables affect the gameplay.
   * @param config 
   */
  async createUpdateMatchConfig(config: MatchConfig): Promise<MatchConfig>
  {
    config = {...config};

    const hash = this.getMatchConfigHash(config);

    let ret = null;

    await pRetry(async () => {
      await this.connection.transaction("SERIALIZABLE", async manager => 
      {   
        // Don't update config if it was already used by a game and the change affects gameplay
        if(config.id)
        {
          const countGamesUsingConfigPromise = manager.count(Game, {where: {matchConfig: {id: config.id}}});
          const countEqualConfigPromise = manager.count(MatchConfig, {where: {id: config.id, configHash: hash}});
          const [countGamesUsing, countEqualConfig] = await Promise.all([countGamesUsingConfigPromise, countEqualConfigPromise]);

          if(countGamesUsing > 0 && countEqualConfig === 0)
          {
            throw new pRetry.AbortError(new HttpException("A match config can't be saved if it was used by a server and the changed variables affect the gameplay.", HttpStatus.INTERNAL_SERVER_ERROR));
          }
        }
        
        config.configHash = hash;

        const saved = await manager.save(MatchConfig, config);     
        ret = await manager.findOne(MatchConfig, {where: {id: saved.id}});        
      });
    }, 
      { retries: 6, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.0666, 0.33)[0] }
    );
      
    return ret;
  }

  /**
   * Get match configs
   * @param options 
   */
  async getMatchConfigs(options: IMatchConfigsQuery): Promise<[MatchConfig[], number, number]>
  {
    options.page = Math.max(options.page ?? 1, 1);
    options.pageSize = _.clamp(options.pageSize ?? MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const ret = await this.matchConfigRepository.findAndCount(
      {
        take: options.pageSize, 
        skip: options.pageSize * (options.page - 1), 
        order: {configName: options.orderDesc ? "DESC" : "ASC"},
        where: options.configName ? {configName: Like(`%${options.configName.trim()}%`)} : undefined
      });

    return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
  }


  /**
   * Delete match config
   * @param options 
   */
  async deleteMatchConfig(options: IMatchConfigIdentifier): Promise<void>
    {
        const foundInUse = await this.gameserverConfigRepository.findOne({relations: ["currentMatchConfig", "gameserver"], where: {currentMatchConfig: options.id ? {id: options.id} : {configName: options.configName}}});
        
        if(foundInUse)
        {
          throw new HttpException(`Config: <${foundInUse.currentMatchConfig.configName}> can't be deleted. Still referenced by at least gameserver: <${foundInUse.gameserver.id}>`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await this.connection
        .createQueryBuilder()
        .delete()
        .from(MatchConfig)
        .where(options.id ? "id = :id" : "configName = :configName", options.id ? { id: options.id } : { configName: options.configName })
        .execute();
    }

  /**
   * Calculate a hash from a match config to allow comparing them in order to detect gameplay affecting changes
   * @param config 
   */
  getMatchConfigHash(config: MatchConfig): string
  {
    config = {...config};
    
    // Exist only for preset management on individual backend
    config.configName = "";
    config.id = 0;
    config.configHash = "";

    // Those times do not affect gameplay
    config.matchendLength = 0;
    config.warmUpLength = 0;

    
    // Player vote variables do not matter if voting is disabled
    if(!config.enablePlayerVote)
    {
      config.playerVoteThreshold = 0;
      config.playerVoteTeamOnly = false;
    }

    // Make sure object always serialises to the same string
    const toBeHashed = Object.entries(config)
      .sort(([kx, vx], [ky, vy]) => kx.toLowerCase().localeCompare(ky.toLowerCase()))
      .reduce((acc, [k, v]) => ({...acc, [k]: v}), {});

    const asString = JSON.stringify(toBeHashed);

    const shaObj = new jsSHA("SHA3-256", "TEXT");
    shaObj.update(asString);
    return shaObj.getHash("HEX");
  }

}
