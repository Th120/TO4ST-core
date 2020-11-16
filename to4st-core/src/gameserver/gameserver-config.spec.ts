import { Test, TestingModule } from '@nestjs/testing';
import { GameserverService } from './gameserver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gameserver } from './gameserver.entity';

import { asyncForEach, } from '../shared/utils';
import { chance } from 'jest-chance'; 
import { forN, N, genTypeORMTestCFG, MIN_N, randomDateInRange  } from '../testUtils';

import _ from 'lodash'
import { MIN_AUTH_KEY_LENGTH, MIN_ID_LENGTH } from '../globals';
import { GameserverConfig } from './gameserver-config.entity';
import { MatchConfig } from './match-config.entity';
import { GameserverConfigService } from './gameserver-config.service';
import { Game } from '../game-statistics/game.entity';
import { GameStatisticsService } from '../game-statistics/game-statistics.service';
import { Repository } from 'typeorm';
import { ServerMap } from '../game-statistics/server-map.entity';
import { Weapon } from '../game-statistics/weapon.entity';
import { SteamUser } from '../core/steam-user.entity';
import { PlayerRoundStats } from '../game-statistics/player-round-stats.entity';
import { PlayerRoundWeaponStats } from '../game-statistics/player-round-weapon-stats.entity';
import { Round } from '../game-statistics/round.entity';
import { GameMode } from '../game-statistics/game-mode.entity';
import { SteamUserService } from '../core/steam-user.service';
import { AppConfigService } from '../core/app-config.service';
import { AppConfig } from '../core/app-config.entity';
import testConfiguration from '../testConfiguration';
import { ConfigModule, ConfigService } from '@nestjs/config';


describe('GameserverConfigService', () => {
  let gameserverService: GameserverService;
  let gameStatisticsService: GameStatisticsService;
  let service: GameserverConfigService;
  let module: TestingModule;
  beforeEach(async () => { 
    module = await Test.createTestingModule({
      imports: [ 
        genTypeORMTestCFG([Gameserver, AppConfig, GameserverConfig, MatchConfig, Game, ServerMap, GameMode, Weapon, Round, PlayerRoundStats, PlayerRoundWeaponStats, SteamUser]), 
        TypeOrmModule.forFeature([Gameserver, AppConfig, GameserverConfig, MatchConfig, Game,  ServerMap, GameMode, Weapon, Round, PlayerRoundStats, PlayerRoundWeaponStats, SteamUser],), 
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
      ], 
      providers: [GameserverService, ConfigService, AppConfigService, GameserverConfigService, GameStatisticsService, SteamUserService]
    }).compile();

    gameserverService = module.get<GameserverService>(GameserverService);
    gameStatisticsService = module.get<GameStatisticsService>(GameStatisticsService); //nightmare to mock, fuck it
    service = module.get<GameserverConfigService>(GameserverConfigService);

    const gameserverRepo: Repository<Gameserver> = module.get("GameserverRepository");

    jest.spyOn(gameserverService, "createUpdateGameserver").mockImplementation(async (server: Gameserver) => {
      const cloned = new Gameserver({...server});
      
      if(!cloned.id)
      {
        cloned.id = chance.guid({version: 4});
      }
      if(!cloned.authKey)
      {
        cloned.authKey = chance.string({length: 32});
      }

      return await gameserverRepo.save(cloned);

    });
  });

  const randomGameserverCreate = async () => {
    return await gameserverService.createUpdateGameserver(new Gameserver({currentName: chance.string({ length: 32 }), authKey: chance.guid({version: 4}), description: chance.sentence(), lastContact: chance.date()}));
  };

  const randomGameserversCreate = async (count: number) => {
    const arr: Gameserver[] = [];
    for(let i = 0; i < count; i++)
    {
      arr.push(await randomGameserverCreate());
    }
    
    return arr;  
  };

  const randomGameMode = (random: number) => {
    const arr = [
      new GameMode({name: "Classic", isTeamBased: true}),
      new GameMode({name: "Capture the Flag", isTeamBased: true}),
      new GameMode({name: "Team Deathmatch", isTeamBased: true}),
    ];

    return arr[random % arr.length];
  };

  const randomGameModeCreate = async (random: number) => {
    return await gameStatisticsService.createUpdateGameMode(randomGameMode(random));
  };

  const randomMatchConfig = async (options?: {ranked?: boolean, gameMode?: GameMode, private?: boolean}) => new MatchConfig({
    gameMode: options?.gameMode ?? await randomGameModeCreate(chance.integer({min: 0, max: 30000})), 
    configName: chance.guid({version: 4}),
    matchEndLength: chance.integer({min: 0, max: 30000}),
    warmUpLength:chance.integer({min: 0, max: 30000}),
    friendlyFireScale: chance.floating({min: 0, max: 1}),
    mapLength: chance.integer({min: 0, max: 30000}),
    roundLength: chance.integer({min: 0, max: 30000}),
    preRoundLength: chance.integer({min: 0, max: 30000}),
    roundEndLength: chance.integer({min: 0, max: 30000}),
    roundLimit: chance.integer({min: 0, max: 30000}),
    allowGhostcam: chance.bool(),
    playerVoteThreshold: chance.floating({min: 0, max: 100}),
    autoBalanceTeams: chance.bool(),
    playerVoteTeamOnly: chance.bool(),
    maxTeamDamage: chance.integer({min: 0, max: 5000}), //24 bit float of mysql might be slightly off with floating values
    enablePlayerVote: chance.bool(),
    autoSwapTeams: chance.bool(),
    midGameBreakLength: chance.integer({min: 0, max: 30000}),
    nadeRestriction: chance.bool(),
    globalVoicechat: chance.bool(),
    muteDeadToTeam: chance.bool(),
    ranked: options?.ranked ?? chance.bool(),
    private: options?.private ??  chance.bool()
  });

  const randomMatchConfigCreate = async (options?: {ranked?: boolean, gameMode?: GameMode, private?: boolean}) => {
    return await service.createUpdateMatchConfig(await randomMatchConfig(options));
  }

  const randomGameserverConfig = (options?: {matchConfig?: MatchConfig, gameserver?: Gameserver, password?: string, reservedSlots?: number}) => new GameserverConfig({
    gameserver: options.gameserver,
    currentName: chance.name(),
    currentMatchConfig: options.matchConfig,
    voteLength: chance.integer({min: 0, max: 30000}),
    gamePassword: options?.password ?? chance.word(),
    reservedSlots: options?.reservedSlots ?? chance.integer({min: 0, max: 30000}),
    balanceClans: chance.bool(),
    allowSkipMapVote: chance.bool(),
    tempKickBanTime: chance.integer({min: 0, max: 30000}),
    autoRecordReplay: chance.bool(),
    playerGameControl: chance.bool(),
    enableMapVote: chance.bool(),
    serverAdmins: chance.sentence(),
    serverDescription: chance.sentence(),
    website: chance.url(),
    contact: chance.sentence(),
    mapNoReplay: chance.integer({min: 0, max: 30000}),
    enableVoicechat: chance.bool(),
  });

  /**
   * Test data gameModes
   */
  const gameModes: Partial<GameMode>[] = [{name: "Classic", isTeamBased: true}, {name: "Capture the Flag", isTeamBased: true}, {name: "Team Deathmatch", isTeamBased: true},];

  /**
   * Test data maps
   */
  const maps: Partial<ServerMap>[] = [{name:"MAP-Blister"}, {name:"MAP-Scope"}, {name:"MAP-RapidWaters"}, {name:"MAP-preAim"}, {name:"MAP-Converge"}, {name:"MAP-Fueled"}, {name: "MAP-Eviction"},{name: "MAP-Prelude"}];

  const randomGameCreate = async (options: {gameserver?: Gameserver, startedAt?: Date, endetAt?: Date, map?: Partial<ServerMap>, gameMode?: Partial<GameMode>, matchConfig?: Partial<MatchConfig>}) => {
    const start = options.startedAt ?? randomDateInRange(new Date(chance.date({year: 1999})), new Date(chance.date({year: 2200})));
    const end = options.endetAt ?? new Date(start.valueOf());
    return await gameStatisticsService.createUpdateGame(new Game(
      {
        gameserver: options.gameserver ?? await randomGameserverCreate(), 
        startedAt: start,
        endedAt: end,
        map: new ServerMap(options.map ?? maps[(chance.integer({min: 1}) % maps.length)] ), 
        gameMode: new GameMode(options.gameMode ?? gameModes[chance.integer({min: 1}) % gameModes.length]),
        matchConfig: options?.matchConfig ? new MatchConfig(options.matchConfig) : undefined
      }));
  };

  afterEach( async () => {
    await module.close();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create match config', async () => {
    const toInsert = await randomMatchConfig();
    const added = await service.createUpdateMatchConfig(toInsert);

    expect(added).toMatchObject(toInsert);
  });
 

  it('update match config', async () => {
    const toInsert = await randomMatchConfig();
    const added = await service.createUpdateMatchConfig(toInsert);

    const updatedRaw = await randomMatchConfig();
    updatedRaw.id = added.id;
    const updated = await service.createUpdateMatchConfig(updatedRaw);

    expect(updated).toMatchObject(updatedRaw);
  });


  it('create gameserver config', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());
    const toInsert = randomGameserverConfig({matchConfig: matchConfig, gameserver: randomGameserver});
    const added = await service.createUpdateGameserverConfig(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  it('create gameserver config no match config', async () => {
    
    const randomGameserver = await randomGameserverCreate();

    const toInsert = randomGameserverConfig({gameserver: randomGameserver});
    
    await expect(service.createUpdateGameserverConfig(toInsert)).rejects.toThrow();
  });

  it('delete used match config (gameserver config)', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());

    const toInsert = randomGameserverConfig({matchConfig: matchConfig, gameserver: randomGameserver});
    const added = await service.createUpdateGameserverConfig(toInsert);

    await expect(service.deleteMatchConfig(matchConfig)).rejects.toThrow();

  });


  it('delete used match config (game)', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());
    const game = await randomGameCreate({gameserver: randomGameserver, matchConfig: matchConfig});

    expect(game.matchConfig).toMatchObject(matchConfig);

    await service.deleteMatchConfig(matchConfig);

    const gameUpdated = await gameStatisticsService.getGame(game.id);

    expect(gameUpdated.matchConfig).toBeFalsy();

  });

  it('change used match config, gameplay affecting', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());
    const game = await randomGameCreate({gameserver: randomGameserver, matchConfig: matchConfig});

    expect(game.matchConfig).toMatchObject(matchConfig);

    matchConfig.roundLength++; 

    await expect(service.createUpdateMatchConfig(matchConfig)).rejects.toThrow();

  });

  it('change used match config, not gameplay affecting', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());
    const game = await randomGameCreate({gameserver: randomGameserver, matchConfig: matchConfig});

    expect(game.matchConfig).toMatchObject(matchConfig);

    matchConfig.configName = chance.guid(); 
    matchConfig.matchEndLength = chance.integer({min:0, max: 30000});
    matchConfig.warmUpLength = chance.integer({min:0, max: 30000});

    expect(await service.createUpdateMatchConfig(matchConfig)).toMatchObject(matchConfig);

  });

  it('create gameserver config, not priv / reserved', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig({private: false}));

    const toInsert = randomGameserverConfig({matchConfig: matchConfig, gameserver: randomGameserver, reservedSlots: 0, password: ""});
    const added = await service.createUpdateGameserverConfig(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  it('create gameserver config, priv, no pw', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig({private: true}));

    const toInsert = randomGameserverConfig({matchConfig: matchConfig, gameserver: randomGameserver, reservedSlots: 0, password: ""});
    
    await expect(service.createUpdateGameserverConfig(toInsert)).rejects.toThrow();
  });

  it('create gameserver config, reserved, no pw', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig({private: false}));

    const toInsert = randomGameserverConfig({matchConfig: matchConfig, gameserver: randomGameserver, reservedSlots: chance.integer({min: 1}), password: ""});
    
    await expect(service.createUpdateGameserverConfig(toInsert)).rejects.toThrow();
  });

  it('create delete gameserver config', async () => {
    
    const randomGameservers = await randomGameserversCreate(N);
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());

    const promises = randomGameservers.map(x => service.createUpdateGameserverConfig(randomGameserverConfig({matchConfig: matchConfig, gameserver: x})));
    const inserted = await Promise.all(promises);

    const keep = inserted.filter((x, i) => i % 3 !== 0);
    const toDelete = inserted.filter((x, i) => i % 3 === 0);

    keep.forEach(x => x.gameserver.currentName = x.currentName) //if a gameserver name is set in the config the gameserver name variable is overridden

    const deletePromises = toDelete.map(x => service.deleteGameserverConfig(x.gameserver));
    await Promise.all(deletePromises);

    await asyncForEach(keep, async x => await expect(await service.getGameserverConfig(x.gameserver)).toMatchObject(x));
    await asyncForEach(toDelete, async x => await expect(await service.getGameserverConfig(x.gameserver)).toBeFalsy());

  });

  it('create delete match config', async () => {
    
    const inserted = [];
    await forN(async () => {
      inserted.push(await randomMatchConfigCreate())
    });

    const keep = inserted.filter((x, i) => i % 3 !== 0);
    const toDelete = inserted.filter((x, i) => i % 3 === 0);

    const deletePromises = toDelete.map(x => service.deleteMatchConfig(x));
    await Promise.all(deletePromises);

    await asyncForEach(keep, async x => await expect(await service.getMatchConfig(x)).toMatchObject(x));
    await asyncForEach(toDelete, async x => await expect(await service.getMatchConfig(x)).toBeFalsy());

  });

  it('create gameserver config', async () => {
    
    const randomGameserver = await randomGameserverCreate();
    const matchConfig = await service.createUpdateMatchConfig(await randomMatchConfig());

    const toInsert = randomGameserverConfig({matchConfig: matchConfig, gameserver: randomGameserver});
    const added = await service.createUpdateGameserverConfig(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  
  
});
