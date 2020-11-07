import { Test, TestingModule } from '@nestjs/testing';
import { GameStatisticsService, } from './game-statistics.service';
import { genTypeORMTestCFG, forN, N, randomDateInRange, dateIsInRange, randomSteamId64s } from '../testUtils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../core/app-config.entity';
import { AuthKey } from '../core/auth-key.entity';
import { Ban } from '../gameserver/ban.entity';
import { Gameserver } from '../gameserver/gameserver.entity';
import { RegisteredPlayer } from '../gameserver/registered-player.entity';
import { Game } from './game.entity';
import { Round } from './round.entity';
import { GameMode } from './game-mode.entity';
import { Weapon, WeaponType } from './weapon.entity';
import { ServerMap } from './server-map.entity';
import { PlayerRoundStats } from './player-round-stats.entity';
import { PlayerRoundWeaponStats } from './player-round-weapon-stats.entity';
import { chance } from 'jest-chance'; 
import { AppConfigService } from '../core/app-config.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { GameserverService } from '../gameserver/gameserver.service';
import { Team, keysMatch, asyncForEach, getNextNFromRingArray, roundDate } from '../shared/utils';
import testConfiguration from '../testConfiguration';
import { Logger, } from '@nestjs/common';
import { MAX_PAGE_SIZE, } from '../globals';
import _ from 'lodash';
import { SteamUserService } from '../core/steam-user.service';
import { SteamUser } from '../core/steam-user.entity';

import { Repository } from 'typeorm';
import { MatchConfig } from '../gameserver/match-config.entity';
import { GameserverConfig } from '../gameserver/gameserver-config.entity';
import { GameserverConfigService } from '../gameserver/gameserver-config.service';


/*
const DEFAULT_GAME_TIME = 1000 * 60 * 120;
const MAX_ROUND_TIME = 1000 * 60 * 5;
const MIN_ROUND_TIME = 1000 * 60 * 1;
const DEFAULT_UNIQUE_PLAYERS = 1000;
const MAX_PLAYER_COUNT_ROUND = 20;
const DEFAULT_WEAPON_COUNT = 3;
const DEFAULT_ROUND_COUNT = 18;
const DEFAULT_GAME_COUNT = 400;
const DEFAULT_GAMESERVER_COUNT = 20;
*/

const SHOULD_LOG = false;

const DEFAULT_GAME_TIME = 1000 * 60 * 120;
const MAX_ROUND_TIME = 1000 * 60 * 5;
const MIN_ROUND_TIME = 1000 * 60 * 2;
const DEFAULT_UNIQUE_PLAYERS = 5;
const MAX_PLAYER_COUNT_ROUND = 5;
const DEFAULT_WEAPON_COUNT = 3;
const DEFAULT_ROUND_COUNT = 5;
const DEFAULT_GAME_COUNT = 10;
const DEFAULT_GAMESERVER_COUNT = 2;

const testLog = (message: string, context: string, timeDiff = true) => {
  if(SHOULD_LOG)
  {
    Logger.log(message, context, timeDiff);
  }
};


const gameModes: Partial<GameMode>[] = [{name: "Classic", isTeamBased: true}, {name: "Capture the Flag", isTeamBased: true}, {name: "Team Deathmatch", isTeamBased: true},];
  const maps: Partial<ServerMap>[] = [{name:"MAP-Blister"}, {name:"MAP-Scope"}, {name:"MAP-RapidWaters"}, {name:"MAP-preAim"}, {name:"MAP-Converge"}, {name:"MAP-Fueled"}, {name: "MAP-Eviction"},{name: "MAP-Prelude"}];
  const weapons: Partial<Weapon>[] = [
    {name: "MP5", weaponType: WeaponType.SMG}, 
    {name: "Vector", weaponType: WeaponType.SMG}, 
    {name: "Saiga", weaponType: WeaponType.SMG}, 
    {name: "AK47", weaponType: WeaponType.RIFLE}, 
    {name: "M4", weaponType: WeaponType.RIFLE}, 
    {name: "AUG", weaponType: WeaponType.RIFLE},
    {name: "M9", weaponType: WeaponType.PISTOL}, 
    {name: "M40", weaponType: WeaponType.RIFLE}, 
    {name: "Glock", weaponType: WeaponType.PISTOL}, 
    {name: "Desert Eagle", weaponType: WeaponType.PISTOL}, 
    {name: "Bomb", weaponType: WeaponType.BOMB}, 
    {name: "HE", weaponType: WeaponType.NADE}, 
  ];

  const currentPositiveRand = chance.integer({min: 0, max: Number.MAX_SAFE_INTEGER - 10000});

describe('GameStatisticsService', () => {
  let service: GameStatisticsService;
  let gameserverService: GameserverService;
  let cfgService: AppConfigService;
  let gameserverConfigService: GameserverConfigService;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
        genTypeORMTestCFG([Game, Ban, RegisteredPlayer, Round, AuthKey, AppConfig, GameMode, Gameserver, Weapon, ServerMap, PlayerRoundStats, PlayerRoundWeaponStats, SteamUser, MatchConfig, GameserverConfig]), 
        TypeOrmModule.forFeature([Game, Ban, RegisteredPlayer, AuthKey, AppConfig, Round, GameMode, Gameserver, Weapon, ServerMap, PlayerRoundStats, PlayerRoundWeaponStats, SteamUser, MatchConfig, GameserverConfig]),
      ],
      providers: [GameStatisticsService, ConfigService, AppConfigService, GameserverService, SteamUserService, GameserverConfigService],
    }).compile();

    service = module.get<GameStatisticsService>(GameStatisticsService);
    cfgService = module.get<AppConfigService>(AppConfigService);
    gameserverService = module.get<GameserverService>(GameserverService);
    gameserverConfigService = module.get<GameserverConfigService>(GameserverConfigService);

    const gameserverRepo: Repository<Gameserver> = module.get("GameserverRepository");
    const gameserverConfigRepo: Repository<GameserverConfig> = module.get("GameserverConfigRepository");
    const matchConfigRepo: Repository<MatchConfig> = module.get("MatchConfigRepository");

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
  
    jest.spyOn(gameserverConfigService, "createUpdateGameserverConfig").mockImplementation(async (gameserverConfig: GameserverConfig) => {
      const cloned = new GameserverConfig({...gameserverConfig});
      cloned.gameserver = new Gameserver({id: gameserverConfig.gameserver.id});
      return await gameserverConfigRepo.save(cloned);
    });

    jest.spyOn(gameserverConfigService, "createUpdateMatchConfig").mockImplementation(async (config: MatchConfig) => {
      const cloned = new MatchConfig({...config});
      cloned.configHash = chance.guid({version: 4});
      return await matchConfigRepo.save(cloned);
    });

  });

  const randomGameserverCreate = async () => {
    return await gameserverService.createUpdateGameserver(new Gameserver({currentName: chance.string({ length: 32 }), authKey: chance.guid({version: 4}), description: chance.sentence(), lastContact: chance.date()}));
  };

  const randomGameMode = (random: number) => {
    return new GameMode(gameModes[random % gameModes.length]);
  };

  const randomGameModeCreate = async (random: number) => {
    return await service.createUpdateGameMode(randomGameMode(random));
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
    maxTeamDamage: chance.floating({min: 0}),
    enablePlayerVote: chance.bool(),
    autoSwapTeams: chance.bool(),
    midGameBreakLength: chance.integer({min: 0, max: 30000}),
    nadeRestriction: chance.bool(),
    globalVoicechat: chance.bool(),
    muteDeadToTeam: chance.bool(),
    ranked: options?.ranked ?? chance.bool(),
    private: options?.private ??  chance.bool()
  });

  const randomGameserversCreate = async (count: number) => {
    const arr: Gameserver[] = [];
    for(let i = 0; i < count; i++)
    {
      arr.push(await randomGameserverCreate());
    }
    
    return arr;  
  };

  const randomGameCreate = async (options: {gameserver?: Gameserver, startedAt?: Date, endetAt?: Date, map?: Partial<ServerMap>, gameMode?: Partial<GameMode>, matchConfig?: Partial<MatchConfig>}) => {
    const start = options.startedAt ?? randomDateInRange(new Date(chance.date({year: 1999})), new Date(chance.date({year: 2200})));
    const end = options.endetAt ?? new Date(start.valueOf() + DEFAULT_GAME_TIME);
    return await service.createUpdateGame(new Game(
      {
        gameserver: options.gameserver ?? await randomGameserverCreate(), 
        startedAt: start,
        endedAt: end,
        map: new ServerMap(options.map ?? maps[(chance.integer({min: 1}) % maps.length)] ), 
        gameMode: new GameMode(options.gameMode ?? gameModes[chance.integer({min: 1}) % gameModes.length]),
        matchConfig: options?.matchConfig ? new MatchConfig(options.matchConfig) : undefined
      }));
  };

  const randomRoundCreate = async (options: {game: Game, startedAt?: Date, endedAt?: Date, scoreSF?: number, scoreTerr?: number, }) => {
    
    const minStart = options.startedAt ?? randomDateInRange(options.game.startedAt ?? new Date(chance.date({year: 1999})), options.game.endedAt ?? new Date(chance.date({year: 2200})));
    const roundEnd = options.endedAt ?? new Date(minStart.valueOf() + chance.integer({min: MIN_ROUND_TIME, max: MAX_ROUND_TIME}));
    
    return await service.createUpdateRound(new Round(
      {
        game: options.game,
        startedAt: minStart, 
        endedAt: roundEnd,
        scoreSpecialForces: options.scoreSF ?? chance.integer({min: 0, max: 30}),
        scoreTerrorists: options.scoreTerr ?? chance.integer({min: 0, max: 30})
      }));
  };

  const randomPlayerRoundStats = (options: {round: Round, steamIds?: string[], count?: number}) => {

    const steamIds = options.steamIds ?? randomSteamId64s({count: options.count, seed: currentPositiveRand});

    return steamIds.map(x => (new PlayerRoundStats(
      {
        round: options.round,
        steamId64: x,
        team: chance.bool() ? Team.SF : Team.TERR,
        totalDamage: chance.floating({min: 0, max: 3000}),
        score: chance.integer({min: 0, max: 400}),
        kills: chance.integer({min: 0, max: 30}),
        deaths: chance.integer({min: 0, max: 20}),
        suicides: chance.integer({min: 0, max: 5})
      })));
  };

  const randomPlayerRoundWeaponStats = (options: {round: Round, steamIds?: string[], count?: number, weaponCount: number}) => {
    
    const steamIds = options.steamIds ?? randomSteamId64s({count: options.count, seed: currentPositiveRand});

    return steamIds.map(steamId64 => {
      return _.range(options.weaponCount).map(i => (new PlayerRoundWeaponStats(
        {
          round: options.round,
          steamId64: steamId64,
          weapon: new Weapon(weapons[(currentPositiveRand + i) % weapons.length]),
          totalDamage: chance.floating({min: 0, max: 400}),
          shotsFired: chance.integer({min: 0, max: 300}),
          shotsArms: chance.integer({min: 0, max: 40}),
          shotsChest: chance.integer({min: 0, max: 75}),
          shotsHead: chance.integer({min: 0, max: 30}),
          shotsLegs: chance.integer({min: 0, max: 50}),
        })));
    }).flat();
  };


  afterEach( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  it('insert + update game, no matchconfig', async() => {
      
    const gameServer = await randomGameserverCreate();

    const game = new Game({gameserver: gameServer, startedAt: new Date(), map: new ServerMap({name: "TestMap1"}), gameMode: new GameMode({name: "Classic", isTeamBased: true})});
    const inserted = await service.createUpdateGame(game);

    expect(inserted).toMatchObject(game);
    
    inserted.endedAt = roundDate(new Date(Date.now() + 6000));
    const updated = await service.createUpdateGame(inserted);

    expect(updated).toMatchObject(inserted);
    expect(updated.matchConfig).toEqual(inserted.matchConfig);
    expect(updated.matchConfig).toBeFalsy();


  });

  it('insert get game, incl. match config', async() => {
      
    const gameServer = await randomGameserverCreate();

    const matchConfig = await gameserverConfigService.createUpdateMatchConfig(await randomMatchConfig());

    const game = new Game(
      {
        gameserver: gameServer, 
        startedAt: new Date(), 
        map: new ServerMap({name: "TestMap1"}), 
        gameMode: new GameMode({name: "Classic", isTeamBased: true}),
        matchConfig: matchConfig
      });
    const inserted = await service.createUpdateGame(game);

    expect(inserted).toMatchObject(game);
    
    inserted.endedAt = roundDate(new Date(Date.now() + 6000));
    const updated = await service.createUpdateGame(inserted);

    expect(updated).toMatchObject(inserted);


  });

  it('insert game, getMap', async() => {
      
    const gameServer = await randomGameserverCreate();

    const mapName = chance.word({length: 10});

    const game = new Game({gameserver: gameServer, startedAt: new Date(Date.now()), map: new ServerMap({name: mapName}), gameMode: new GameMode({name: "Classic", isTeamBased: true})});
    const inserted = await service.createUpdateGame(game);

    expect(inserted).toMatchObject(game);
    
    const findByName = await service.getMap({name: mapName});
    expect(findByName.name).toEqual(mapName);

    const findById = await service.getMap({id: game.map.id});
    expect(findById.name).toEqual(mapName);

  });
  
  it('insert game, getGameMode', async() => {
      
    const gameServer = await randomGameserverCreate();

    const mapName = chance.word({length: 10});
    const modeName = chance.word({length: 16});

    const game = new Game({gameserver: gameServer, startedAt: new Date(Date.now()), map: new ServerMap({name: mapName}), gameMode: new GameMode({name: modeName, isTeamBased: true})});
    const inserted = await service.createUpdateGame(game);

    expect(inserted).toMatchObject(game);
    
    const findByName = await service.getGameMode({name: modeName});
    expect(findByName.name).toEqual(modeName);

    const findById = await service.getGameMode({id: game.gameMode.id});
    expect(findById.name).toEqual(modeName);
  });

  it('insert game, getGameMode', async() => {
      
    const gameServer = await randomGameserverCreate();

    const gamesWithGameModes = gameModes.map(x => new Game(
      {
        gameserver: gameServer, 
        startedAt: new Date(Date.now()), 
        map: new ServerMap({name: chance.word()}), 
        gameMode: new GameMode(x)
      })
    );

    await asyncForEach(gamesWithGameModes, async x => {await service.createUpdateGame(x)});

    let [foundGameModes, total, totalPages] = await service.getGameModes({page: 1});

    expect(total).toBe(gamesWithGameModes.length);

    //Get all pages and merge them into result archive
    if(foundGameModes.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        foundGameModes = [...foundGameModes, ...(await service.getGameModes({page: 1}))[0]];
      }
    }

    expect(total).toBe(foundGameModes.length);

    const shouldBeInserted = gamesWithGameModes.map(x => x.gameMode);

    shouldBeInserted.forEach(x => {
      expect(foundGameModes.find(y => y.name === x.name)).toBeDefined();
    });
  
  });

  it('insert multi get games, ranked only, asc', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const matchConfigR = await gameserverConfigService.createUpdateMatchConfig(await randomMatchConfig({ranked: true}));
    const matchConfigNOPE = await gameserverConfigService.createUpdateMatchConfig(await randomMatchConfig({ranked: false}));

    const insertedGames: Game[] = []

    await forN(async (idx: number) => {

      const inserted = await randomGameCreate(
        {
          gameserver: idx % 2 == 0 ? gameServer : gameServer2, 
          startedAt: new Date(Date.now() + idx * 5000),
          matchConfig: idx % 2 == 0 ? matchConfigR : (idx % 3 == 0 ? undefined : matchConfigNOPE)
      });
      
      insertedGames.push(inserted);
    });

    const filtered = insertedGames.filter(x => !!x.matchConfig?.ranked);
    
    let [games, total, totalPages] = await service.getGames({ranked: true, orderDesc: false});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i, ranked: true, orderDesc: false}))[0]];
      }
    }

    expect(games.length).toBe(filtered.length);

    insertedGames.filter(x => !!x.matchConfig?.ranked).sort((x, y) => roundDate(x.startedAt).valueOf() - roundDate(y.startedAt).valueOf()).forEach( (x, i) => {
      expect(games[i]).toMatchObject(x);
    });

  });

  it('insert multi get games asc', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedGames: Game[] = []

    await forN(async (idx: number) => {

      const inserted = await randomGameCreate({gameserver: idx % 2 == 0 ? gameServer : gameServer2, startedAt: new Date(Date.now() + idx * 5000)});
      
      insertedGames.push(inserted);
    });

    
    let [games, total, totalPages] = await service.getGames({});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(N);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i}))[0]];
      }
    }

    expect(games.length).toBe(N);

    insertedGames.sort((x, y) => roundDate(x.startedAt).valueOf() - roundDate(y.startedAt).valueOf()).forEach( (x, i) => {
      expect(games[i]).toMatchObject(x);
    });

  });

  it('insert multi get games desc', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedGames: Game[] = []

    await forN(async (idx: number) => {

      const inserted = await randomGameCreate({gameserver: idx % 2 == 0 ? gameServer : gameServer2, startedAt: new Date(Date.now() + idx * 5000)});
      
      insertedGames.push(inserted);
    });

    
    let [games, total, totalPages] = await service.getGames({orderDesc: true});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(N);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i, orderDesc: true}))[0]];
      }
    }

    expect(games.length).toBe(N);

    insertedGames.sort((x, y) => roundDate(y.startedAt).valueOf() - roundDate(x.startedAt).valueOf()).forEach( (x, i) => {
      expect(games[i]).toMatchObject(x);
    });

  });

  it('insert multi get by startedAt', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedGames: Game[] = []

    const startDate = new Date(chance.date({year: 1999}));
    const endDate = new Date(chance.date({year: 2050}));

    const rangeA = new Date(chance.date({year: 2012}));
    const rangeB = new Date(chance.date({year: 2024}));

    let lastDate = startDate;

    await forN(async (idx: number) => {
      lastDate = randomDateInRange(startDate, endDate);
      
      const inserted = await randomGameCreate({gameserver: idx % 2 == 0 ? gameServer : gameServer2, startedAt: lastDate, });
      
      insertedGames.push(inserted);
    });

    const filtered = insertedGames.filter(x => dateIsInRange(x.startedAt, rangeA, rangeB));
    
    let [games, total, totalPages] = await service.getGames({startedAfter: rangeA, startedBefore: rangeB});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i, startedAfter: rangeA, startedBefore: rangeB}))[0]];
      }
    }
    

    expect(games.length).toBe(filtered.length);

    filtered.forEach( x => {
      const other = games.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });

  it('insert multi get by map', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedGames: Game[] = [];


    await forN(async (idx: number) => {     
      const inserted = await randomGameCreate({gameserver: idx % 2 == 0 ? gameServer : gameServer2, map: maps[idx % maps.length],})
      insertedGames.push(inserted);
    });

    const filtered = insertedGames.filter(x => x.map.name === maps[0].name);
    
    let [games, total, totalPages] = await service.getGames({map: new ServerMap({name: maps[0].name})});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i, map: new ServerMap({name: maps[0].name})}))[0]];
      }
    }
  
    expect(games.length).toBe(filtered.length);

    filtered.forEach( x => {
      const other = games.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });

  it('insert multi get by gamemode', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedGames: Game[] = [];

    await forN(async (idx: number) => {     
      const inserted = await randomGameCreate({gameserver: idx % 2 == 0 ? gameServer : gameServer2, gameMode: gameModes[idx % gameModes.length]})
      insertedGames.push(inserted);
    });

    const filtered = insertedGames.filter(x => x.gameMode.name === gameModes[0].name);
    
    let [games, total, totalPages] = await service.getGames({gameMode: new GameMode({name: gameModes[0].name})});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i, gameMode: new GameMode({name: gameModes[0].name})}))[0]];
      }
    }
  
    expect(games.length).toBe(filtered.length);

    filtered.forEach( x => {
      const other = games.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });

  it('insert multi get by gameServer', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedGames: Game[] = [];
    

    await forN(async (idx: number) => {     
      const inserted = await randomGameCreate({gameserver: idx % 2 == 0 ? gameServer : gameServer2, })
      insertedGames.push(inserted);
    });

    const filtered = insertedGames.filter(x => x.gameserver.id === gameServer2.id);
    
    let [games, total, totalPages] = await service.getGames({gameserver: gameServer2});    
    expect(games.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(games.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        games = [...games, ...(await service.getGames({page: i, gameserver: gameServer2}))[0]];
      }
    }
  
    expect(games.length).toBe(filtered.length);

    filtered.forEach( x => {
      const other = games.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });

  it('insert / update game', async() => {
      
    const gameServer = await randomGameserverCreate();

    const game = await randomGameCreate({gameserver: gameServer});
        
    game.endedAt = chance.date();
    game.roundDates();

    const updated = await service.createUpdateGame(game);

    expect(game).toMatchObject(updated);
  });

  it('insert / update round', async() => {
      
    const gameServer = await randomGameserverCreate();

    const game = await randomGameCreate({gameserver: gameServer});
        
    const round = new Round({game: game, startedAt: chance.date()});
    const inserted = await service.createUpdateRound(round);

    expect(inserted).toMatchObject(round);

    inserted.endedAt = new Date(Date.now() + 6000);
    inserted.scoreSpecialForces = 3;
    inserted.scoreTerrorists = 2;
    inserted.roundDates();

    const updated = await service.createUpdateRound(inserted);

    expect(inserted).toMatchObject(updated);
  });

  it('insert multi get rounds, ranked only, asc', async() => {
      
    const gameServer = await randomGameserverCreate();

    let insertedConfigs: MatchConfig[] = [];

    insertedConfigs.push(await gameserverConfigService.createUpdateMatchConfig(await randomMatchConfig({ranked: true})));
    insertedConfigs.push(await gameserverConfigService.createUpdateMatchConfig(await randomMatchConfig({ranked: false})));
    insertedConfigs.push(undefined);

    let insertedRounds: Round[] = [];
    const games = [
      await randomGameCreate(
        {gameserver: gameServer, startedAt: randomDateInRange(new Date(chance.date({year: 1980})), new Date(chance.date({year: 2001}))), 
        endetAt: randomDateInRange(new Date(chance.date({year: 2099})), new Date(chance.date({year: 2200}))), matchConfig: insertedConfigs[0]}), 
      await randomGameCreate(
        {gameserver: gameServer, startedAt: randomDateInRange(new Date(chance.date({year: 1980})), new Date(chance.date({year: 2001}))), 
        endetAt: randomDateInRange(new Date(chance.date({year: 2099})), new Date(chance.date({year: 2200}))), matchConfig: insertedConfigs[1]}), 
      await randomGameCreate(
        {gameserver: gameServer, startedAt: randomDateInRange(new Date(chance.date({year: 1980})), new Date(chance.date({year: 2001}))), 
        endetAt: randomDateInRange(new Date(chance.date({year: 2099})), new Date(chance.date({year: 2200}))), matchConfig: insertedConfigs[2]}),   
    ];

    await forN(async (idx: number) => {
     
      const inserted = await randomRoundCreate({game: games[idx % games.length], })
      insertedRounds.push(inserted);
    });

    const filtered = insertedRounds.filter(x => x.game?.matchConfig?.ranked).sort((x, y) => roundDate(x.startedAt).valueOf() - roundDate(y.startedAt).valueOf());
    
    let [rounds, total, totalPages] = await service.getRounds({orderDesc: false, ranked: true});    
    expect(rounds.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(rounds.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        rounds = [...rounds, ...(await service.getRounds({page: i, orderDesc: false, ranked: true}))[0]];
      }
    }

    expect(rounds.length).toBe(filtered.length);

    filtered.forEach( (x, i) => {
      expect(rounds[i]).toMatchObject(x);
    });

  });
  

  it('insert multi get rounds desc', async() => {
      
    const gameServer = await randomGameserverCreate();

    const insertedRounds: Round[] = [];
    const games = [
      await randomGameCreate(
        {gameserver: gameServer, startedAt: randomDateInRange(new Date(chance.date({year: 1980})), new Date(chance.date({year: 2001}))), 
        endetAt: randomDateInRange(new Date(chance.date({year: 2099})), new Date(chance.date({year: 2200})))}), 
      await randomGameCreate(
        {gameserver: gameServer, startedAt: randomDateInRange(new Date(chance.date({year: 1980})), new Date(chance.date({year: 2001}))), 
        endetAt: randomDateInRange(new Date(chance.date({year: 2099})), new Date(chance.date({year: 2200})))}), 
      await randomGameCreate(
        {gameserver: gameServer, startedAt: randomDateInRange(new Date(chance.date({year: 1980})), new Date(chance.date({year: 2001}))), 
        endetAt: randomDateInRange(new Date(chance.date({year: 2099})), new Date(chance.date({year: 2200})))}),   
    ];

    await forN(async (idx: number) => {
     
      const inserted = await randomRoundCreate({game: games[idx % games.length], })
      insertedRounds.push(inserted);
    });

    
    let [rounds, total, totalPages] = await service.getRounds({orderDesc: true});    
    expect(rounds.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(N);

    //Get all pages and merge them into result archive
    if(rounds.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        rounds = [...rounds, ...(await service.getRounds({page: i, orderDesc: true}))[0]];
      }
    }

    expect(rounds.length).toBe(N);

    insertedRounds.sort((x, y) => roundDate(y.startedAt).valueOf() - roundDate(x.startedAt).valueOf()).forEach( (x, i) => {
      expect(rounds[i]).toMatchObject(x);
    });

  });

  it('insert multi get rounds by startedAt', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const startDate = new Date(chance.date({year: 2020}));
    const endDate = new Date(chance.date({year: 2021}));

    const rangeA = new Date(chance.date({year: 2020, month: 8}));
    const rangeB = new Date(chance.date({year: 2021, month: 4}));

    const startDateGame = randomDateInRange(startDate, endDate);

    const insertedRounds: Round[] = [];
    const games = [await randomGameCreate({gameserver: gameServer, startedAt: startDateGame}), await randomGameCreate({gameserver: gameServer2, startedAt: startDateGame}),];

    await forN(async (idx: number) => {
      
      const inserted = await randomRoundCreate({game: games[idx % games.length], })
      insertedRounds.push(inserted);
    });

    const filtered = insertedRounds.filter(x => roundDate(x.startedAt).valueOf() < roundDate(rangeB).valueOf() && roundDate(x.startedAt).valueOf() > roundDate(rangeA).valueOf());

    let [rounds, total, totalPages] = await service.getRounds({startedAfter: rangeA, startedBefore: rangeB});    
    expect(rounds.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(rounds.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        rounds = [...rounds, ...(await service.getRounds({page: i, startedAfter: rangeA, startedBefore: rangeB}))[0]];
      }
    }

    expect(rounds.length).toBe(filtered.length);

    filtered.forEach( x => {
      const other = rounds.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });


  it('insert multi get rounds by game', async() => {
      
    const gameServer = await randomGameserverCreate();
    const gameServer2 = await randomGameserverCreate();

    const insertedRounds: Round[] = [];
    const games = [await randomGameCreate({gameserver: gameServer, }), await randomGameCreate({gameserver: gameServer2, }),];

    await forN(async (idx: number) => {
      
      const inserted = await randomRoundCreate({game: games[idx % games.length], })
      insertedRounds.push(inserted);
    });

    const filtered = insertedRounds.filter(x => x.game.id === games[1].id);

    let [rounds, total, totalPages] = await service.getRounds({game: games[1]});    
    expect(rounds.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(filtered.length);

    //Get all pages and merge them into result archive
    if(rounds.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        rounds = [...rounds, ...(await service.getRounds({page: i, game: games[1]}))[0]];
      }
    }

    expect(rounds.length).toBe(filtered.length);

    filtered.forEach( x => {
      const other = rounds.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });

  
  it('insert multi PlayerRoundStats', async() => {
      
    const gameServer = await randomGameserverCreate();

    const game = await randomGameCreate({gameserver: gameServer});

    const stats: PlayerRoundStats[] = [];

    const round1 = await randomRoundCreate({game: game, });
    const round2 = await randomRoundCreate({game: game, });

    const steamIds = randomSteamId64s({count: MAX_PLAYER_COUNT_ROUND, seed: chance.integer()})

    const newStats1 = randomPlayerRoundStats({round: round1, steamIds: steamIds, count: MAX_PLAYER_COUNT_ROUND});
    const newStats2 = randomPlayerRoundStats({round: round2, steamIds: steamIds, count: MAX_PLAYER_COUNT_ROUND});
    stats.push(...newStats1);
    stats.push(...newStats2);

    await service.createUpdatePlayerRoundStats(stats);
    
    let [rounds1, total1, totalPages1] = await service.getRoundStatistics({round: round1});    
    expect(rounds1.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total1).toBe(MAX_PLAYER_COUNT_ROUND);

    //Get all pages and merge them into result archive
    if(rounds1.length != total1) 
    {
      for(let i = 2; i <= totalPages1; i++)
      {
        rounds1 = [...rounds1, ...(await service.getRoundStatistics({page: i, round: round1}))[0]];
      }
    }

    expect(rounds1.length).toBe(MAX_PLAYER_COUNT_ROUND);

    let [rounds2, total2, totalPages2] = await service.getRoundStatistics({round: round2});    
    expect(rounds2.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total2).toBe(MAX_PLAYER_COUNT_ROUND);

    //Get all pages and merge them into result archive
    if(rounds2.length != total2) 
    {
      for(let i = 2; i <= totalPages2; i++)
      {
        rounds2 = [...rounds2, ...(await service.getRoundStatistics({page: i, round: round2}))[0]];
      }
    }

    //db float != js float
    stats.forEach(x => x.totalDamage = Math.round(x.totalDamage));
    rounds1.forEach(x => x.totalDamage = Math.round(x.totalDamage));
    rounds2.forEach(x => x.totalDamage = Math.round(x.totalDamage));

    expect(rounds2.length).toBe(MAX_PLAYER_COUNT_ROUND);
    
    rounds1.forEach( x => {
      const other = stats.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

    rounds2.forEach( x => {
      const other = stats.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });
  });

  it('simple insert multi PlayerRoundWeaponStats', async() => {
      
    const gameServer = await randomGameserverCreate();

    const game = await randomGameCreate({gameserver: gameServer});
   
    const round = await randomRoundCreate({game: game, });
    const newStats = randomPlayerRoundWeaponStats({round: round, count: MAX_PLAYER_COUNT_ROUND, weaponCount: DEFAULT_WEAPON_COUNT});
   
    await service.createUpdatePlayerRoundWeaponStats(newStats);

    const round2 = await randomRoundCreate({game: game, });
    const newStats2 = randomPlayerRoundWeaponStats({round: round2, count: MAX_PLAYER_COUNT_ROUND, weaponCount: DEFAULT_WEAPON_COUNT});
   
    await service.createUpdatePlayerRoundWeaponStats(newStats2);
        
    let [roundWeapStats, total, totalPages] = await service.getRoundWeaponStatistics({round: round});    
    expect(roundWeapStats.length).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    expect(total).toBe(MAX_PLAYER_COUNT_ROUND * DEFAULT_WEAPON_COUNT);

    //Get all pages and merge them into result archive
    if(roundWeapStats.length != total) 
    {
      for(let i = 2; i <= totalPages; i++)
      {
        roundWeapStats = [...roundWeapStats, ...(await service.getRoundWeaponStatistics({page: i, round: round}))[0]];
      }
    }

    //db float != js float
    newStats.forEach(x => x.totalDamage = Math.round(x.totalDamage));
    roundWeapStats.forEach(x => x.totalDamage = Math.round(x.totalDamage));

    expect(roundWeapStats.length).toBe(MAX_PLAYER_COUNT_ROUND * DEFAULT_WEAPON_COUNT);

    roundWeapStats.forEach( x => {
      const other = newStats.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

  });

  it('insert playerRoundStats invalid steamId64', async() => {
      
    const gameServer = await randomGameserverCreate();
    const game = await randomGameCreate({gameserver: gameServer});
    const round = await randomRoundCreate({game: game, });
   
    const entry = new PlayerRoundStats(
      {
        round: round,
        steamId64: chance.word(),
        team: chance.bool() ? Team.SF : Team.TERR,
        totalDamage: chance.floating({min: 0, max: 3000}),
        score: chance.integer({min: 0, max: 400}),
        kills: chance.integer({min: 0, max: 30}),
        deaths: chance.integer({min: 0, max: 20}),
        suicides: chance.integer({min: 0, max: 5})
      });

    await expect(service.createUpdatePlayerRoundStats([entry])).rejects.toThrow();

  });

  it('insert playerRoundWeaponStats invalid steamId64', async() => {
      
    const gameServer = await randomGameserverCreate();
    const game = await randomGameCreate({gameserver: gameServer});
    const round = await randomRoundCreate({game: game, });
   
    const entry = new PlayerRoundWeaponStats(
      {
        round: round,
        steamId64: chance.word(),
        weapon: new Weapon(weapons[(currentPositiveRand + chance.integer({min: 0})) % weapons.length]),
        totalDamage: chance.floating({min: 0, max: 400}),
        shotsFired: chance.integer({min: 0, max: 300}),
        shotsArms: chance.integer({min: 0, max: 40}),
        shotsChest: chance.integer({min: 0, max: 75}),
        shotsHead: chance.integer({min: 0, max: 30}),
        shotsLegs: chance.integer({min: 0, max: 50}),
      });

    await expect(service.createUpdatePlayerRoundWeaponStats([entry])).rejects.toThrow();

  });

  it('delete games and cascade', async() => {
      
    const numGameservers = 3;
    const numPlayers = 20;
    const numGames = 10;
    const numRounds = 5;

    const gameServers = await randomGameserversCreate(numGameservers);
    const players = randomSteamId64s({count: numPlayers, seed: currentPositiveRand});

    const games: Game[] = [];

    for(let i = 0; i < numGames; i++)
    {
      const game = await randomGameCreate({gameserver: gameServers[i % gameServers.length],});
      games.push(game);
    }

    const rounds: Round[] = [];
    
    await asyncForEach(games, async (game, idx) => {
      
      let lastDate = game.startedAt;
      for(let i = 0; i < numRounds; i++)
      {
        const created = await randomRoundCreate({game: game, startedAt: new Date(lastDate.valueOf() + chance.integer({min: 2000, max: 4000}))})
        rounds.push(created);
        lastDate = created.endedAt;
      }

    });

    const playerRoundStats: PlayerRoundStats[] = rounds.map((round, idx) => {

      const steamIds = getNextNFromRingArray(players, MAX_PLAYER_COUNT_ROUND, idx);
      const currPlayerRoundStats = randomPlayerRoundStats({steamIds: steamIds, round: round});

      return currPlayerRoundStats;

    }).flat();

    await service.createUpdatePlayerRoundStats(playerRoundStats);

    const playerRoundWeaponStats: PlayerRoundWeaponStats[] =  rounds.map((round, idx) => {
      
      const steamIds = getNextNFromRingArray(players, MAX_PLAYER_COUNT_ROUND, idx);
      const currPlayerRoundWeaponStats = randomPlayerRoundWeaponStats({steamIds: steamIds, round: round, weaponCount: DEFAULT_WEAPON_COUNT});
      return currPlayerRoundWeaponStats;
     
    }).flat();

    await service.createUpdatePlayerRoundWeaponStats(playerRoundWeaponStats);

    const gamesToBeDeleted = _.shuffle(games).filter((x, idx) => idx <= games.length / 3);
    const roundsToBeDeleted = rounds.filter(x => !!gamesToBeDeleted.find(y => y.id === x.game.id));
    const playerRoundStatsToBeDeleted = playerRoundStats.filter(x => !!roundsToBeDeleted.find(y => y.id === x.round.id));
    const playerRoundWeaponStatsToBeDeleted = playerRoundWeaponStats.filter(x => !!roundsToBeDeleted.find(y => y.id === x.round.id));

    await service.deleteGames(gamesToBeDeleted);

    await asyncForEach(gamesToBeDeleted, async x => {
      const found = await service.getGame(x.id);
      expect(found).toBeFalsy();
    });

    await asyncForEach(roundsToBeDeleted, async x => {
      const found = await service.getRound(x.id);
      expect(found).toBeFalsy();
    });

    await asyncForEach(playerRoundStatsToBeDeleted, async x => {
      const found = await service.getRoundStatistics({round: x.round})
      expect(found[0].length).toBe(0);
    });

    await asyncForEach(playerRoundWeaponStatsToBeDeleted, async x => {
      const found = await service.getRoundWeaponStatistics({round: x.round})
      expect(found[0].length).toBe(0);
    });

  });
});
