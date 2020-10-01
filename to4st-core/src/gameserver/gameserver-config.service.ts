import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import _ from "lodash"
import { Repository, Connection, Like } from 'typeorm';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import jsSHA from "jssha";
import pRetry from "p-retry";

import { Gameserver } from './gameserver.entity';
import { MAX_PAGE_SIZE } from '../globals';
import { GameserverConfig } from './gameserver-config.entity';
import { MatchConfig } from './match-config.entity';
import { TIMEOUT_PROMISE_FACTORY } from 'src/shared/utils';
import { Game } from 'src/game-statistics/game.entity';

/**
 * Interface used to identify a gameserver
 */
export interface IMatchConfigIdentifier {
  /**
   * Name of the configuration preset
   */
  name?: string, 

  /**
   * Id of config preset
   */
  id?: number
}

/**
 * Interface used to query match configuration presets
 */
export interface IMatchConfigQuery {
  /**
   * Desired page
   */
  page?: number, 

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
    return await this.gameserverConfigRepository.findOne({relations: ["gameserver, currentMatchConfig"], where: {gameserver: {id: gameserver.id}}});
  }

  /**
   * Create or update gameserver configuration
   * @param gameserverConfig 
   */
  async createUpdateGameserverConfig(gameserverConfig: GameserverConfig)
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

    const inserted = await this.gameserverConfigRepository.save(gameserverConfig);
    return await this.getGameserverConfig(inserted.gameserver);
  }

  /**
   * Get single match config
   * @param options 
   */
  async getMatchConfig(options: IMatchConfigIdentifier)
  {
    return await this.matchConfigRepository.findOne({where: options.id ? {id: options.id} : {name: Like(`%${options.name.trim()}%`)}});
  }

  /**
   * Create / update match config
   * A config can't be edited if it is referenced by a game and the changed variables affect the gameplay.
   * @param config 
   */
  async createUpdateMatchConfig(config: MatchConfig)
  {
    config = {...config};

    const hash = this.getMatchConfigHash(config);

    let saved: MatchConfig = null;

    await pRetry(async () => {
      await this.connection.transaction("SERIALIZABLE", async manager => 
      {   
        // Don't update config if it was already used by a game and the change affects gameplay
        if(config.id)
        {
          const countGamesUsingConfigPromise = manager.count(Game, {where: {id: config.id}});
          const countEqualConfigPromise = manager.count(MatchConfig, {where: {id: config.id, configHash: hash}});
          const [countGamesUsing, countEqualConfig] = await Promise.all([countGamesUsingConfigPromise, countEqualConfigPromise]);

          if(countGamesUsing > 0 && countEqualConfig === 0)
          {
            throw new pRetry.AbortError(new HttpException("A match config can't be saved if it was used by a server and the changed variables affect the gameplay.", HttpStatus.INTERNAL_SERVER_ERROR));
          }
        }
        
        config.configHash = hash;

        saved = await manager.save(MatchConfig, config);          
      });
    }, 
      { retries: 6, onFailedAttempt: async (error) => await TIMEOUT_PROMISE_FACTORY(0.12)[0] }
    );
      
    return await this.getMatchConfig(saved);
  }

  /**
   * Get match configs
   * @param options 
   */
  async getMatchConfigs(options: IMatchConfigQuery): Promise<[MatchConfig[], number, number]>
  {
    options.page = Math.max(options.page ?? 1, 1);
    options.pageSize = _.clamp(options.pageSize ?? MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const ret = await this.matchConfigRepository.findAndCount({take: options.pageSize, skip: options.pageSize * (options.page - 1), order: {configName: options.orderDesc ? "DESC" : "ASC"}});

    return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
  }

  /**
   * Delete match config
   * @param options 
   */
  async deleteMatchConfig(options: IMatchConfigIdentifier): Promise<void>
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(MatchConfig)
        .where(options.id ? "id = :id" : "name: :name", options.id ? { id: options.id } : { name: options.name })
        .execute();
    }

  /**
   * Calculate a hash from a match config to allow comparing them in order to detect gameplay affecting changes
   * @param config 
   */
  getMatchConfigHash(config: MatchConfig): string
  {
    config = {...config};
    
    // Exists only for preset management on individual backend
    config.configName = "";

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

    const shaObj = new jsSHA("SHA3-256", "TEXT");
    shaObj.update(JSON.stringify(toBeHashed));
    return shaObj.getHash("HEX");
  }

}
