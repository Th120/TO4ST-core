import { Test, TestingModule } from '@nestjs/testing';
import { GameStatisticsService,} from './game-statistics.service';
import { genTypeORMTestCFG, randomSteamId64, forN, N, randomDateInRange, dateIsInRange, randomSteamId64s } from '../testUtils';
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
import { Team, keysMatch, asyncForEach, getNextNFromRingArray, roundDate, steamId64ToAccountId } from '../shared/utils';
import testConfiguration from '../testConfiguration';
import { Logger, } from '@nestjs/common';
import { MAX_PAGE_SIZE, MAX_PAGE_SIZE_WITH_STEAMID } from '../globals';
import _ from 'lodash';
import { SteamUserService } from '../core/steam-user.service';
import { SteamUser } from '../core/steam-user.entity';
import { AggregatedGameStatisticsService } from './aggregated-game-statistics.service';
import { Repository } from 'typeorm';
import { PlayerStatistics, OrderPlayerBaseStats } from './player-statistics';
import { PlayerWeaponStatistics } from './player-weapon-statistics';
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

const DEFAULT_GAME_TIME = 1000 * 60 * 120; // should always be higher than the count of maps / gamemodes
const MAX_ROUND_TIME = 1000 * 60 * 5;
const MIN_ROUND_TIME = 1000 * 60 * 2;
const DEFAULT_UNIQUE_PLAYERS = 10;
const MAX_PLAYER_COUNT_ROUND = 5;
const DEFAULT_WEAPON_COUNT = 3;
const DEFAULT_ROUND_COUNT = 6;
const DEFAULT_GAME_COUNT = 20;
const DEFAULT_GAMESERVER_COUNT = 3; // at least 3!

const testLog = (message: string, context: string, timeDiff = true) => {
  if(SHOULD_LOG)
  {
    Logger.log(message, context, timeDiff);
  }
};

/**
 * Aggregates weapon stats from test data
 * @param playerRoundWeaponStats stats source data
 * @param steamId64 
 * @param cond additional condition for stats entry
 * @returns Map of stats per weapon
 */
const aggregateWeaponStats = (playerRoundWeaponStats: PlayerRoundWeaponStats[] , steamId64: string, cond: (roundWeaponStats: PlayerRoundWeaponStats) => boolean): Map<string, PlayerWeaponStatistics>  => {
  const mapWeapons = new Map<string, PlayerWeaponStatistics>();

  playerRoundWeaponStats.forEach(x => {
    if(x.steamId64 === steamId64 && cond(x))
    {
      const found = mapWeapons.get(x.weapon.name);
      if(found)
      {
        found.shotsArms += x.shotsArms;
        found.shotsChest += x.shotsChest;
        found.totalDamage += x.totalDamage;
        found.totalShots += x.shotsFired;
        found.shotsHead += x.shotsHead;
        found.shotsLegs += x.shotsLegs;
      }
      else
      {
        mapWeapons.set(x.weapon.name, 
          {
            totalDamage: x.totalDamage, 
            totalShots: x.shotsFired, 
            shotsArms: x.shotsArms, 
            shotsChest: x.shotsChest, 
            shotsHead: x.shotsHead, 
            shotsLegs: x.shotsLegs
          } as PlayerWeaponStatistics);
      }
    }
   });

  //db float != js float
  for(const stats of mapWeapons)
  {
    stats[1].totalDamage = Math.round(stats[1].totalDamage);
  }

  return mapWeapons;
};

/**
 * Aggregates weapon stats from test data
 * @param playerRoundStats stats source data
 * @param steamId64 
 * @param cond additional condition for stats entry
 * @param sort should be sorted by
 * @param orderDesc
 * @returns Map of stats per weapon
 */
const aggregatedPlayerRoundStats = (playerRoundStats: PlayerRoundStats[], cond: (roundStats: PlayerRoundStats) => boolean, sort?: (a: PlayerStatistics, b: PlayerStatistics) => number, orderDesc = true): PlayerStatistics[] => {
      
  const aggregated = new Map<string, {stats: PlayerStatistics, games: string[], rounds: number[]}>();

  playerRoundStats.filter(x => cond(x)).forEach(x => {

    const found = aggregated.get(x.steamId64);

    if(found)
    {
      found.stats.deaths += x.deaths;
      found.stats.kills += x.kills;
      found.stats.suicides += x.suicides;
      found.stats.totalDamage += x.totalDamage;
      found.stats.totalScore += x.score;

      if(!found.rounds.find(r => r === x.round.id))
      {
        found.stats.numberRoundsPlayed += 1;
        found.rounds.push(x.round.id);
      }

      if(!found.games.find(r => r === x.round.game.id))
      {
        found.stats.numberGamesPlayed += 1;
        found.games.push(x.round.game.id);
      }
    }
    else
    {
      aggregated.set(x.steamId64, 
        {
          stats:
          {
            suicides: x.suicides, 
            rank: 0,
            deaths: x.deaths, 
            kills: x.kills, 
            totalDamage: x.totalDamage, 
            totalScore: x.score, 
            steamId64: x.steamId64,
            numberGamesPlayed: 1,
            numberRoundsPlayed: 1,
            killDeathRatio: 0,
            avgDamagePerRound: 0,
            avgScorePerRound: 0
          },
          games: [x.round.game.id], 
          rounds: [x.round.id],
        });
    }
  });

  const secSort = (x: PlayerStatistics, y: PlayerStatistics) => orderDesc ? (y.totalScore - x.totalScore) || (y.totalDamage - x.totalDamage) : (x.totalScore - y.totalScore) || (x.totalDamage - y.totalDamage);
  const mapped = Array.from(aggregated.values()).map(x => x.stats);

  mapped.forEach((x, idx) => {
    x.totalDamage = Math.round(x.totalDamage);
    x.killDeathRatio = x.kills / (x.deaths + x.suicides);
    x.avgDamagePerRound = x.totalDamage / Math.max(x.numberRoundsPlayed, 1);
    x.avgScorePerRound = x.totalScore / Math.max(x.numberRoundsPlayed, 1);
  });//db float != js float

  const res =  !!sort ? mapped.sort((x, y) => sort(x, y) || secSort(x, y)) : mapped;
  res.forEach((x, idx) => x.rank = idx + 1);

  return res;
};

/**
 * Test data gameModes
 */
const gameModes: Partial<GameMode>[] = [{name: "Classic", isTeamBased: true}, {name: "Capture the Flag", isTeamBased: true}, {name: "Team Deathmatch", isTeamBased: true},];

/**
 * Test data maps
 */
const maps: Partial<ServerMap>[] = [{name:"MAP-Blister"}, {name:"MAP-Scope"}, {name:"MAP-RapidWaters"}, {name:"MAP-preAim"}, {name:"MAP-Converge"}, {name:"MAP-Fueled"}, {name: "MAP-Eviction"},{name: "MAP-Prelude"}];

/**
 * Test data weapons
 */
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

describe('AggregatedGameStatisticsService', () => {
  let service: AggregatedGameStatisticsService;
  let gameStatsService: GameStatisticsService;
  let gameserverService: GameserverService
  let cfgService: AppConfigService
  let module: TestingModule;
  let players: string[];
  let gameservers: Gameserver[];
  let games: Game[];
  let rounds: Round[];
  let playerRoundStats: PlayerRoundStats[];
  let playerRoundWeaponStats: PlayerRoundWeaponStats[];
  let gameserverConfigService: GameserverConfigService;

  /**
   * Creates random gameserver
   */
  const randomGameserverCreate = async () => {
    return await gameserverService.createUpdateGameserver(new Gameserver({currentName: chance.string({ length: 32 }), authKey: chance.guid({version: 4}), description: chance.sentence(), lastContact: chance.date()}));
  };

  /**
   * Creates list of random gameservers
   * @param count 
   */
  const randomGameserversCreate = async (count: number) => {
    const arr: Gameserver[] = [];
    for(let i = 0; i < count; i++)
    {
      arr.push(await randomGameserverCreate());
    }
    
    return arr;  
  };

  /**
   * Creates random game
   * @param options
   */
  const randomGameCreate = async (options: {gameserver?: Gameserver, startedAt?: Date, map?: Partial<ServerMap>, gameMode?: Partial<GameMode>, matchConfig?: Partial<MatchConfig>}) => {
    const start = options.startedAt ?? randomDateInRange(new Date(chance.date({year: 1999})), new Date(chance.date({year: 2200})));
    return await gameStatsService.createUpdateGame(new Game(
      {
        gameserver: options.gameserver ?? await randomGameserverCreate(), 
        startedAt: start,
        endedAt: new Date(start.valueOf() + DEFAULT_GAME_TIME),
        map: new ServerMap(options.map ?? maps[(chance.integer({min: 1}) % maps.length)] ), 
        gameMode: new GameMode(options.gameMode ?? gameModes[chance.integer({min: 1}) % gameModes.length]),
        matchConfig: options?.matchConfig ? new MatchConfig(options.matchConfig) : undefined
      }));
  };

  /**
   * Creates random round
   * @param options 
   */
  const randomRoundCreate = async (options: {game: Game, startedAt?: Date, endedAt?: Date, scoreSF?: number, scoreTerr?: number, }) => {
    
    const minStart = options.startedAt ?? options.game.startedAt ?? randomDateInRange(new Date(chance.date({year: 1999})), new Date(chance.date({year: 2200})));
    const roundEnd = options.endedAt ?? new Date(minStart.valueOf() + chance.integer({min: MIN_ROUND_TIME, max: MAX_ROUND_TIME}));
    
    return await gameStatsService.createUpdateRound(new Round(
      {
        game: options.game,
        startedAt: roundDate(minStart), 
        endedAt: roundDate(roundEnd),
        scoreSpecialForces: options.scoreSF ?? chance.integer({min: 0, max: 30}),
        scoreTerrorists: options.scoreTerr ?? chance.integer({min: 0, max: 30})
      }));
  };

  /**
   * Generates random player stats
   * @param options 
   */
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

  /**
   * Generates random match config
   * @param options 
   */
  const randomMatchConfig = (options?: {ranked?: boolean}) => new MatchConfig({
    configName: chance.word(),
    matchendLength: chance.integer({min: 0, max: 30000}),
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
    private: chance.bool()
  });

  /**
   * Generates random player weapon stats
   * @param options 
   */
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


  /**
   * Fills database with test data which is used to test stats getters
   */
  const fillExampleDatabase = async () => {

    const gameServers = await randomGameserversCreate(DEFAULT_GAMESERVER_COUNT);
  
    let insertedConfigs: MatchConfig[] = [];

    insertedConfigs.push(await gameserverConfigService.createUpdateMatchConfig(randomMatchConfig({ranked: true})));
    insertedConfigs.push(await gameserverConfigService.createUpdateMatchConfig(randomMatchConfig({ranked: false})));
    insertedConfigs.push(undefined);

    testLog("Inserted Gameservers", "CreateExampleDatabase");

    const startDate = new Date(chance.date({year: 2012}));

    const players = randomSteamId64s({count: DEFAULT_UNIQUE_PLAYERS, seed: currentPositiveRand});

    testLog("Generated steamIds", "CreateExampleDatabase");

    const games: Game[] = [];

    let lastEnd = startDate;

    for(let i = 0; i < DEFAULT_GAME_COUNT; i++)
    {
      const game = await randomGameCreate({
        gameserver: gameServers[i % gameServers.length], 
        startedAt: new Date(lastEnd.valueOf() + 1000 * 60 * 60), 
        gameMode: new GameMode(gameModes[i % gameModes.length]),
        map: new ServerMap(maps[i % maps.length]), 
        matchConfig: insertedConfigs[i % insertedConfigs.length]
      });
      lastEnd = game.endedAt;
      games.push(game);
    }

    testLog("Created Games", "CreateExampleDatabase", true);

    const rounds: Round[] = [];
    

    await asyncForEach(games, async (game, idx) => {
      
      if(idx % 100 == 0)
      {
        testLog(`Rounds generated for: ${idx} / ${games.length}`, "CreateExampleDatabase", true);
      }

      let lastDate = game.startedAt;
      for(let i = 0; i < DEFAULT_ROUND_COUNT; i++)
      {
        const created = await randomRoundCreate({game: game, startedAt: new Date(lastDate.valueOf() + chance.integer({min: 2000, max: 4000}))})
        rounds.push(created);
        lastDate = created.endedAt;
      }

    });

    testLog(`Generating ${rounds.length * MAX_PLAYER_COUNT_ROUND} PlayerRoundStats`, "CreateExampleDatabase", true);

    const playerRoundStats: PlayerRoundStats[] = rounds.map((round, idx) => {

      const steamIds = getNextNFromRingArray(players, MAX_PLAYER_COUNT_ROUND, idx);
      const currPlayerRoundStats = randomPlayerRoundStats({steamIds: steamIds, round: round});

      return currPlayerRoundStats;

    }).flat();

    await gameStatsService.createUpdatePlayerRoundStats(playerRoundStats);

    testLog(`Generating ${rounds.length * MAX_PLAYER_COUNT_ROUND * DEFAULT_WEAPON_COUNT} PlayerRoundWeaponStats`, "CreateExampleDatabase", true);

    const playerRoundWeaponStats: PlayerRoundWeaponStats[] =  rounds.map((round, idx) => {
      
      const steamIds = getNextNFromRingArray(players, MAX_PLAYER_COUNT_ROUND, idx);
      const currPlayerRoundWeaponStats = randomPlayerRoundWeaponStats({steamIds: steamIds, round: round, weaponCount: DEFAULT_WEAPON_COUNT});
      return currPlayerRoundWeaponStats;
     
    }).flat();

    await gameStatsService.createUpdatePlayerRoundWeaponStats(playerRoundWeaponStats);

    testLog("Create example db finished", "CreateExampleDatabase", true);

    return {players: players, gameservers: gameServers, games: games, rounds: rounds, playerRoundStats: playerRoundStats, playerRoundWeaponStats: playerRoundWeaponStats};

  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
        genTypeORMTestCFG([Game, Ban, RegisteredPlayer, Round, AuthKey, AppConfig, GameMode, Gameserver, Weapon, ServerMap, PlayerRoundStats, PlayerRoundWeaponStats, SteamUser, MatchConfig, GameserverConfig]), 
        TypeOrmModule.forFeature([Game, Ban, RegisteredPlayer, AuthKey, AppConfig, Round, GameMode, Gameserver, Weapon, ServerMap, PlayerRoundStats, PlayerRoundWeaponStats, SteamUser, MatchConfig, GameserverConfig]),
      ],
      providers: [GameStatisticsService, ConfigService, AppConfigService, SteamUserService, GameserverService, AggregatedGameStatisticsService, GameserverConfigService],
    }).compile();

    service = module.get<AggregatedGameStatisticsService>(AggregatedGameStatisticsService);
    cfgService = module.get<AppConfigService>(AppConfigService);
    gameserverService = module.get<GameserverService>(GameserverService);
    gameStatsService = module.get<GameStatisticsService>(GameStatisticsService);
    gameserverConfigService = module.get<GameserverConfigService>(GameserverConfigService);
    
    const gameserverConfigRepo: Repository<GameserverConfig> = module.get("GameserverConfigRepository");
    const matchConfigRepo: Repository<MatchConfig> = module.get("MatchConfigRepository");
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

    const data = await fillExampleDatabase();
    players = data.players;
    gameservers = data.gameservers;
    games = data.games;
    rounds = data.rounds;
    playerRoundStats = data.playerRoundStats;
    playerRoundWeaponStats = data.playerRoundWeaponStats;
  }, 1000 * 60 * 20);

  afterAll( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('Get Playerstats Simple', async() => { 

   const randPlayer = players[chance.integer({min: 0}) % players.length]; 

   let dmg = 0;
   let kills = 0;
   let score = 0;
   let deaths = 0;
   let suicides = 0;

   testLog("Calculate expected result ...", "Get Playerstats Simple", true);
   playerRoundStats.forEach(x => {
    if(x.steamId64 === randPlayer)
    {
      dmg += x.totalDamage;
      kills += x.kills;
      score += x.score;
      deaths += x.deaths;
      suicides += x.suicides;
    }
   });

   testLog("Calculated expected result ...", "Get Playerstats Simple", true);

   testLog("Run service", "Get Playerstats Simple", true);

   const [res, total, pages] = await service.getPlayerStatistics({steamId64: randPlayer});

   testLog("Service found result", "Get Playerstats Simple", true);
   
   expect(kills).toBe(res[0].kills);
   expect(Math.round(dmg)).toBe(Math.round(res[0].totalDamage));
   expect(score).toBe(res[0].totalScore);
   expect(deaths).toBe(res[0].deaths);
   expect(suicides).toBe(res[0].suicides);
  }, );

  it('Get Playerstats check limiting / page size', async() => { 

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
 
    const [res, total, pages] = await service.getPlayerStatistics({});

    expect(res.length).toBeLessThanOrEqual(MAX_PAGE_SIZE_WITH_STEAMID);
 
    
   }, );

  it('Get Playerstats By StartedAt', async() => { 

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
 
    let dmg = 0;
    let kills = 0;
    let score = 0;
    let deaths = 0;
    let suicides = 0;
 
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
 
    playerRoundStats.forEach(x => {

      if(x.round.startedAt.valueOf() < min && x.steamId64 === randPlayer)
      {
        min = x.round.startedAt.valueOf();
      }
 
      if(x.round.startedAt.valueOf() > max && x.steamId64 === randPlayer)
      {
        max = x.round.startedAt.valueOf();
      }
    });

    // only include the middle fraction of matches (1/3)
    const rangeA = new Date((max - min) / 3 + min); 
    const rangeB = new Date(max - (max - min) / 3); 

    testLog("Calculate expected result ...", "Get Playerstats By StartedAt", true);
    playerRoundStats.forEach(x => {

     if(x.steamId64 === randPlayer && roundDate(x.round.startedAt).valueOf() >= roundDate(rangeA).valueOf() && roundDate(x.round.startedAt).valueOf() <= roundDate(rangeB).valueOf())
     {
       dmg += x.totalDamage;
       kills += x.kills;
       score += x.score;
       deaths += x.deaths;
       suicides += x.suicides;
     }
    });

    testLog("Calculated expected result ...", "Get Playerstats By StartedAt", true);
 
    testLog("Run service", "Get Playerstats By StartedAt", true);
 
    const [res, total, pages] = await service.getPlayerStatistics({steamId64: randPlayer, startedAfter: rangeA, startedBefore: rangeB});
 
    expect(total).toBe(1);
    expect(pages).toBe(1);

    testLog("Service found result", "Get Playerstats By StartedAt", true);
    
    expect(res[0].kills).toBe(kills);
    expect(Math.round(res[0].totalDamage)).toBe(Math.round(dmg));
    expect(res[0].totalScore).toBe(score);
    expect(res[0].deaths).toBe(deaths);
    expect(res[0].suicides).toBe(suicides);
   }, );

   
  it('Get Playerstats By EndedAt', async() => { 

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
 
    let dmg = 0;
    let kills = 0;
    let score = 0;
    let deaths = 0;
    let suicides = 0;
 
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
 
    playerRoundStats.forEach(x => {

      if(x.round.endedAt.valueOf() < min && x.steamId64 === randPlayer)
      {
        min = x.round.endedAt.valueOf();
      }
 
      if(x.round.endedAt.valueOf() > max && x.steamId64 === randPlayer)
      {
        max = x.round.endedAt.valueOf();
      }
    });

    // only include the middle fraction of matches (1/3)
    const rangeA = new Date((max - min) / 3 + min); 
    const rangeB = new Date(max - (max - min) / 3); 
 
    testLog("Calculate expected result ...", "Get Playerstats By StartedAt", true);
    playerRoundStats.forEach(x => {

     if(x.steamId64 === randPlayer && roundDate(x.round.endedAt).valueOf() > roundDate(rangeA).valueOf() && roundDate(x.round.endedAt).valueOf() < roundDate(rangeB).valueOf())
     {
       dmg += x.totalDamage;
       kills += x.kills;
       score += x.score;
       deaths += x.deaths;
       suicides += x.suicides;
     }
    });

    testLog("Calculated expected result ...", "Get Playerstats By StartedAt", true);
 
    testLog("Run service", "Get Playerstats By StartedAt", true);
 
    const [res, total, pages] = await service.getPlayerStatistics({steamId64: randPlayer, endedAfter: rangeA, endedBefore: rangeB});
 
    expect(total).toBe(1);
    expect(pages).toBe(1);

    testLog("Service found result", "Get Playerstats By StartedAt", true);
    
    expect(res[0].kills).toBe(kills);
    expect(Math.round(res[0].totalDamage)).toBe(Math.round(dmg));
    expect(res[0].totalScore).toBe(score);
    expect(res[0].deaths).toBe(deaths);
    expect(res[0].suicides).toBe(suicides);
   }, );


   it('Get Playerstats By Game', async() => { 

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
 
    let dmg = 0;
    let kills = 0;
    let score = 0;
    let deaths = 0;
    let suicides = 0;

    const randGame = playerRoundStats.filter(x => x.steamId64 === randPlayer).map(x => x.round.game)[0];
 
    testLog("Calculate expected result ...", 'Get Playerstats By Game', true);
    playerRoundStats.forEach(x => {
     if(x.steamId64 === randPlayer && x.round.game.id === randGame.id)
     {
       dmg += x.totalDamage;
       kills += x.kills;
       score += x.score;
       deaths += x.deaths;
       suicides += x.suicides;
     }
    });
 
    testLog("Calculated expected result ...", 'Get Playerstats By Game', true);
 
    testLog("Run service", 'Get Playerstats By Game', true);
 

    const [res, total, pages] = await service.getPlayerStatistics({steamId64: randPlayer, game: randGame});
    expect(total).toBe(1);
 
    testLog("Service found result", 'Get Playerstats By Game', true);
    
    expect(kills).toBe(res[0].kills);
    expect(Math.round(res[0].totalDamage)).toBe(Math.round(dmg));
    expect(score).toBe(res[0].totalScore);
    expect(deaths).toBe(res[0].deaths);
    expect(suicides).toBe(res[0].suicides);
   }, );

   it('Get Playerstats By Round', async() => { 

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
 
    let dmg = 0;
    let kills = 0;
    let score = 0;
    let deaths = 0;
    let suicides = 0;

    const randRound = playerRoundStats.filter(x => x.steamId64 === randPlayer).map(x => x.round)[0];
 
    testLog("Calculate expected result ...", 'Get Playerstats By Round', true);
    playerRoundStats.forEach(x => {
     if(x.steamId64 === randPlayer && x.round.id === randRound.id)
     {
       dmg += x.totalDamage;
       kills += x.kills;
       score += x.score;
       deaths += x.deaths;
       suicides += x.suicides;
     }
    });
 
    testLog("Calculated expected result ...", 'Get Playerstats By Round', true);
 
    testLog("Run service", 'Get Playerstats By Round', true);
 
    const [res, total, pages] = await service.getPlayerStatistics({steamId64: randPlayer, round: randRound});
 
    testLog("Service found result", 'Get Playerstats By Round', true);
    
    expect(kills).toBe(res[0].kills);
    expect(Math.round(res[0].totalDamage)).toBe(Math.round(dmg));
    expect(score).toBe(res[0].totalScore);
    expect(deaths).toBe(res[0].deaths);
    expect(suicides).toBe(res[0].suicides);
   }, );

   it('Get Playerstats By GameMode', async() => { 

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
 
    let dmg = 0;
    let kills = 0;
    let score = 0;
    let deaths = 0;
    let suicides = 0;

    const randGameMode = playerRoundStats.filter(x => x.steamId64 === randPlayer).map(x => x.round.game.gameMode)[0];
 
    testLog("Calculate expected result ...", 'Get Playerstats By GameMode', true);
    playerRoundStats.forEach(x => {
     if(x.steamId64 === randPlayer && x.round.game.gameMode.id === randGameMode.id)
     {
       dmg += x.totalDamage;
       kills += x.kills;
       score += x.score;
       deaths += x.deaths;
       suicides += x.suicides;
     }
    });
 
    testLog("Calculated expected result ...", 'Get Playerstats By GameMode', true);
 
    testLog("Run service", 'Get Playerstats By GameMode', true);
 
    const [res, total, pages] = await service.getPlayerStatistics({steamId64: randPlayer, gameMode: randGameMode});
 
    testLog("Service found result", 'Get Playerstats By GameMode', true);
    
    expect(kills).toBe(res[0].kills);
    expect(Math.round(res[0].totalDamage)).toBe(Math.round(dmg));
    expect(score).toBe(res[0].totalScore);
    expect(deaths).toBe(res[0].deaths);
    expect(suicides).toBe(res[0].suicides);
   }, );

   it('Get Playerstats For Game Sort By Kills', async() => { 

    const randGame = playerRoundStats.map(x => x.round.game)[chance.integer({min: 0}) % playerRoundStats.length];

    testLog("Calculate expected result ...", 'Get Playerstats For Game Sort By Kills', true);
 
    const sorted = aggregatedPlayerRoundStats(playerRoundStats, (x) => x.round.game.id === randGame.id, (x, y) => y.kills - x.kills, true);   
 
    testLog("Calculated expected result ...", 'Get Playerstats For Game Sort By Kills', true);
 
    testLog("Run service", 'Get Playerstats For Game Sort By Kills', true);
 
    let [res, total, pages] = await service.getPlayerStatistics({game: randGame, orderBy: OrderPlayerBaseStats.sumKills, orderDesc: true});
 
    expect(total).toBe(sorted.length);

    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getPlayerStatistics({page: i, game: randGame, orderBy: OrderPlayerBaseStats.sumKills, orderDesc: true}))[0]];
      }
    }

    testLog("Service found result", 'Get Playerstats For Game Sort By Kills', true);
    
    expect(res.length).toBe(sorted.length);
    
    res.forEach((x, idx) => expect(x.steamId64).toBe(sorted[idx].steamId64));

   }, );

   it('Get Playerstats, ranked only, Sort By Kills', async() => { 

    testLog("Calculate expected result ...", 'Get Playerstats, ranked only, Sort By Kills', true);
 
    const sorted = aggregatedPlayerRoundStats(playerRoundStats, (x) => x.round.game.matchConfig?.ranked, (x, y) => y.kills - x.kills, true);   
 
    testLog("Calculated expected result ...", 'Get Playerstats, ranked only, Sort By Kills', true);
 
    testLog("Run service", 'Get Playerstats, ranked only, Sort By Kills', true);
 
    let [res, total, pages] = await service.getPlayerStatistics({ranked: true, orderBy: OrderPlayerBaseStats.sumKills, orderDesc: true});
 
    expect(total).toBe(sorted.length);

    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getPlayerStatistics({page: i, ranked: true, orderBy: OrderPlayerBaseStats.sumKills, orderDesc: true}))[0]];
      }
    }

    testLog("Service found result", 'Get Playerstats, ranked only, Sort By Kills', true);
    
    expect(res.length).toBe(sorted.length);
    
    res.forEach((x, idx) => expect(x.steamId64).toBe(sorted[idx].steamId64));

   }, );

   it('Get Playerstats Sort By Deaths', async() => { 

    testLog("Calculate expected result ...", 'Get Playerstats Sort By Deaths', true);
    
    const sorted = aggregatedPlayerRoundStats(playerRoundStats, () => true, (x, y) => y.deaths - x.deaths, true);   
 
    testLog("Calculated expected result ...", 'Get Playerstats Sort By Deaths', true);
 
    testLog("Run service", 'Get Playerstats Sort By Deaths', true);
 
    let [res, total, pages] = await service.getPlayerStatistics({orderBy: OrderPlayerBaseStats.sumDeaths, orderDesc: true});

    expect(total).toBe(sorted.length);

    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getPlayerStatistics({page: i, orderBy: OrderPlayerBaseStats.sumDeaths, orderDesc: true}))[0]];
      }
    }
 
    testLog("Service found result", 'Get Playerstats Sort By Deaths', true);
    
    expect(res.length).toBe(sorted.length);
    
    res.forEach((x, idx) => expect(x.steamId64).toBe(sorted[idx].steamId64));

   }, );

   
   it('Get Playerstats Sort By Score ASC', async() => { 

    testLog("Calculate expected result ...", 'Get Playerstats Sort By Score ASC', true);
    
     

  const sorted = aggregatedPlayerRoundStats(playerRoundStats, () => true, (x, y) => x.totalScore - y.totalScore, false)   

  testLog("Calculated expected result ...", 'Get Playerstats Sort By Score ASC', true);

  testLog("Run service", 'Get Playerstats Sort By Score ASC', true);

  let [res, total, pages] = await service.getPlayerStatistics({orderBy: OrderPlayerBaseStats.sumScore, orderDesc: false});

  expect(total).toBe(sorted.length);

  //Get all pages and merge them into result archive
  if(res.length != total) 
  {
    for(let i = 2; i <= pages; i++)
    {
      res = [...res, ...(await service.getPlayerStatistics({page: i, orderBy: OrderPlayerBaseStats.sumScore, orderDesc: false}))[0]];
    }
  }

  testLog("Service found result", 'Get Playerstats Sort By Score ASC', true);
  
  expect(res.length).toBe(sorted.length);
 

  res.forEach((x, idx) => expect(x.steamId64).toBe(sorted[idx].steamId64));

 }, );


  it("Get PlayerWeaponStats Simple", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 

    testLog("Calculate expected result ...", "Get PlayerWeaponStats Simple", true);

    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => true);

    testLog("Run service", "Get PlayerWeaponStats Simple", true);

    const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

    testLog("Service found result", "Get PlayerWeaponStats Simple", true);

    resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });

   it("Get PlayerWeaponStats Simple, ranked only", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 

    testLog("Calculate expected result ...", "Get PlayerWeaponStats Simple, ranked only", true);

    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => x.round.game.matchConfig?.ranked);

    testLog("Run service", "Get PlayerWeaponStats Simple, ranked only", true);

    const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer, ranked: true});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

    testLog("Service found result", "Get PlayerWeaponStats Simple, ranked only", true);

    resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });


   it("Get PlayerWeaponStats By StartedAt", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 

    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
 
    playerRoundWeaponStats.forEach(x => {
      if(x.round.startedAt.valueOf() < min && x.steamId64 === randPlayer)
      {
        min = x.round.startedAt.valueOf();
      }
 
      if(x.round.startedAt.valueOf() > max && x.steamId64 === randPlayer)
      {
        max = x.round.startedAt.valueOf();
      }
    });
    
    // only include the middle fraction of matches (1/3)
    const rangeA = new Date((max - min) / 3 + min); 
    const rangeB = new Date(max - (max - min) / 3); 

    testLog("Calculate expected result ...", "Get PlayerWeaponStats By StartedAt", true);

    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => roundDate(x.round.startedAt).valueOf() > roundDate(rangeA).valueOf() && roundDate(x.round.startedAt).valueOf() < roundDate(rangeB).valueOf());


    testLog("Run service", "Get PlayerWeaponStats By StartedAt", true);

   const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer, startedAfter: rangeA, startedBefore: rangeB});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

   testLog("Service found result", "Get PlayerWeaponStats By StartedAt", true);

   resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });

   
   it("Get PlayerWeaponStats By EndedAt", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 

    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
 
    playerRoundWeaponStats.forEach(x => {
      if(x.round.endedAt.valueOf() < min && x.steamId64 === randPlayer)
      {
        min = x.round.endedAt.valueOf();
      }
 
      if(x.round.endedAt.valueOf() > max && x.steamId64 === randPlayer)
      {
        max = x.round.endedAt.valueOf();
      }
    });
    
    // only include the middle fraction of matches (1/3)
    const rangeA = new Date((max - min) / 3 + min); 
    const rangeB = new Date(max - (max - min) / 3); 

    testLog("Calculate expected result ...", "Get PlayerWeaponStats By StartedAt", true);

    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => roundDate(x.round.endedAt).valueOf() > roundDate(rangeA).valueOf() && roundDate(x.round.endedAt).valueOf() < roundDate(rangeB).valueOf());


    testLog("Run service", "Get PlayerWeaponStats By StartedAt", true);

   const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer, endedAfter: rangeA, endedBefore: rangeB});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

   testLog("Service found result", "Get PlayerWeaponStats By StartedAt", true);

   resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });

   it("Get PlayerWeaponStats By Round", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
   
    const randRound = playerRoundWeaponStats.filter(x => x.steamId64 === randPlayer).map(x => x.round)[0];

    testLog("Calculate expected result ...", "Get PlayerWeaponStats By Round", true);

    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => x.round.id === randRound.id);

    testLog("Run service", "Get PlayerWeaponStats By Round", true);

   const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer, round: randRound});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

   testLog("Service found result", "Get PlayerWeaponStats By Round", true);

   resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });

   it("Get PlayerWeaponStats By Game", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
   
    const randGame = playerRoundWeaponStats.filter(x => x.steamId64 === randPlayer).map(x => x.round.game)[0];

    testLog("Calculate expected result ...", "Get PlayerWeaponStats By Game", true);

    

    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => x.round.game.id === randGame.id);


    testLog("Run service", "Get PlayerWeaponStats By Game", true);

   const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer, game: randGame});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

   testLog("Service found result", "Get PlayerWeaponStats By Game", true);

   resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });

   it("Get PlayerWeaponStats By GameMode", async () => {

    const randPlayer = players[chance.integer({min: 0}) % players.length]; 
   
    const randGameMode = playerRoundWeaponStats.filter(x => x.steamId64 === randPlayer).map(x => x.round.game.gameMode)[0];

    testLog("Calculate expected result ...", "Get PlayerWeaponStats By Game", true);

    
    const mapWeapons = aggregateWeaponStats(playerRoundWeaponStats, randPlayer, x => x.round.game.gameMode.id === randGameMode.id);
  
    testLog("Run service", "Get PlayerWeaponStats By Game", true);

   const resWeap = await service.getPlayerWeaponStatistics({steamId64: randPlayer, gameMode: randGameMode});

   //db float != js float
   resWeap.forEach(x => x.totalDamage = Math.round(x.totalDamage));

   testLog("Service found result", "Get PlayerWeaponStats By Game", true);

   resWeap.forEach(x => expect(x).toMatchObject(mapWeapons.get(x.weapon.name)));
   
   });

  it("Get playercount by gameMode", async () => {
    const randGameMode = games[chance.integer({min:0}) % games.length].gameMode;
    const playersByGameMode = playerRoundStats.filter(x => x.round.game.gameMode.name === randGameMode.name).map(x => x.steamId64);
    const uniquePlayers = _.uniq(playersByGameMode);
    
    const inDb = await service.getCountUniquePlayers({gameMode: randGameMode});

    expect(inDb).toBe(uniquePlayers.length);
  });

  it("Get playercount by round", async () => {
    const randRound = rounds[chance.integer({min:0}) % rounds.length];
    const playersByGameMode = playerRoundStats.filter(x => x.round.id === randRound.id).map(x => x.steamId64);
    const uniquePlayers = _.uniq(playersByGameMode);
    
    const inDb = await service.getCountUniquePlayers({round: randRound});

    expect(inDb).toBe(uniquePlayers.length);
  });

  it("Get playercount by startedBefore", async () => {
    
    const minStartedAtValue = _.minBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();
    const maxStartedAtValue = _.maxBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();

    const skip = (maxStartedAtValue - minStartedAtValue) * 0.5 + minStartedAtValue;

    const playersByGameMode = playerRoundStats.filter(x => x.round.startedAt.valueOf() <= skip).map(x => x.steamId64);
    const uniquePlayers = _.uniq(playersByGameMode);
    
    const inDb = await service.getCountUniquePlayers({startedBefore: new Date(skip)});

    expect(inDb).toBe(uniquePlayers.length);
  });

  it("Get playercount by startedAfter", async () => {
    
    const minStartedAtValue = _.minBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();
    const maxStartedAtValue = _.maxBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();

    const skip = (maxStartedAtValue - minStartedAtValue) * 0.5 + minStartedAtValue;
    
    const playersByGameMode = playerRoundStats.filter(x => x.round.startedAt.valueOf() >= skip).map(x => x.steamId64);
    const uniquePlayers = _.uniq(playersByGameMode);
    
    const inDb = await service.getCountUniquePlayers({startedAfter: new Date(skip)});

    expect(inDb).toBe(uniquePlayers.length);
  });

  it("Get playercount by endedAfter", async () => {
    
    const minStartedAtValue = _.minBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();
    const maxStartedAtValue = _.maxBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();

    const skip = (maxStartedAtValue - minStartedAtValue) * 0.5 + minStartedAtValue;
    
    const playersByGameMode = playerRoundStats.filter(x => x.round.endedAt.valueOf() >= skip).map(x => x.steamId64);
    const uniquePlayers = _.uniq(playersByGameMode);
    
    const inDb = await service.getCountUniquePlayers({endedAfter: new Date(skip)});

    expect(inDb).toBe(uniquePlayers.length);
  });

  it("Get playercount by endedBefore", async () => {
    
    const minStartedAtValue = _.minBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();
    const maxStartedAtValue = _.maxBy(rounds, x => x.startedAt.valueOf()).startedAt.valueOf();

    const skip = (maxStartedAtValue - minStartedAtValue) * 0.5 + minStartedAtValue;

    const playersByGameMode = playerRoundStats.filter(x => x.round.endedAt.valueOf() <= skip).map(x => x.steamId64);
    const uniquePlayers = _.uniq(playersByGameMode);
    
    const inDb = await service.getCountUniquePlayers({endedBefore: new Date(skip)});

    expect(inDb).toBe(uniquePlayers.length);
  });
  
});