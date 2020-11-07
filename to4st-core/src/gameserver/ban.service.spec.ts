import { Test, TestingModule } from '@nestjs/testing';
import { GameserverService } from './gameserver.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { Gameserver } from './gameserver.entity';

import { asyncForEach, keysMatch } from '../shared/utils';
import { chance } from 'jest-chance'; 
import { forN, N, randomSteamId64, genTypeORMTestCFG, randomDateInRange,  } from '../testUtils';
import { Ban } from './ban.entity';

import _ from 'lodash'
import { MAX_PAGE_SIZE_WITH_STEAMID } from '../globals';
import { SteamUserService } from '../core/steam-user.service';
import { AppConfigService } from '../core/app-config.service';
import { AppConfig } from '../core/app-config.entity';

import { ConfigService, ConfigModule } from '@nestjs/config';

import { SteamUser } from '../core/steam-user.entity';
import testConfiguration from '../testConfiguration';

import { BanService } from './ban.service';
import { Repository } from 'typeorm';
import { GameserverConfig } from './gameserver-config.entity';
import { MatchConfig } from './match-config.entity';
import { GameMode } from '../game-statistics/game-mode.entity';





describe('BanService', () => {
  let service: BanService
  let module: TestingModule;
  let cfgService: AppConfigService
  let gameserverService: GameserverService;
  beforeEach(async () => { 
    module = await Test.createTestingModule({
      imports: [ 
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
        genTypeORMTestCFG([AppConfig, Ban, Gameserver,  SteamUser, GameserverConfig, MatchConfig, GameMode]), 
        TypeOrmModule.forFeature([AppConfig, Ban, Gameserver, SteamUser, GameserverConfig, MatchConfig, GameMode],), 
       
      ], 
      providers: [SteamUserService, AppConfigService, ConfigService, SteamUserService, BanService, GameserverService, ]
    }).compile();

    service = module.get<BanService>(BanService);
    cfgService = module.get<AppConfigService>(AppConfigService);
    gameserverService = module.get<GameserverService>(GameserverService);

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

  afterEach( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const randomGameserver = () => {
    return new Gameserver({currentName: chance.string({ length: 32 }), authKey: chance.guid({version: 4}), description: chance.sentence(), lastContact: chance.date()});
  };

  const createRandomGameserver = async () => 
  {
    return await gameserverService.createUpdateGameserver(randomGameserver());
  }

  const randomBan = (gameserver: Gameserver, options?: {expiredAt?: Date, bannedSteamId?: string, bannedBySteamId?: string}) => {
    return new Ban({
      steamId64: options?.bannedSteamId ?? randomSteamId64(), 
      bannedById64: options?.bannedBySteamId ?? randomSteamId64(), 
      expiredAt: options?.expiredAt ?? chance.date(), 
      reason: chance.sentence(), 
      gameserver: gameserver, 
      id1: chance.string({length: 32}), 
      id2: chance.string({length: 32})
      });
  };


  it('simple create ban', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    const added = await service.createUpdateBan(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  it('create ban, banned self', async () => {

    const gameServer = await createRandomGameserver();
    const steamId = randomSteamId64();
    const toInsert = new Ban({steamId64: steamId, bannedById64: steamId, expiredAt: chance.date()});
    await expect(service.createUpdateBan(toInsert)).rejects.toThrow();
  });

  it('create ban, no expiration date', async () => {

    const gameServer = await createRandomGameserver();
    const steamId = randomSteamId64();
    const toInsert = new Ban({steamId64: steamId});
    await expect(service.createUpdateBan(toInsert)).rejects.toThrow();
  });

  it('create ban, no steamId', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = new Ban({expiredAt: chance.date()});
    await expect(service.createUpdateBan(toInsert)).rejects.toThrow();
  });

  it('create ban, invalid steamId64', async () => {

    const gameServer = await createRandomGameserver();
    const steamId = randomSteamId64();
    const toInsert = new Ban({steamId64: chance.word(), expiredAt: chance.date()});
    await expect(service.createUpdateBan(toInsert)).rejects.toThrow();
  });

  it('create ban, invalid bannedBySteamId64', async () => {

    const gameServer = await createRandomGameserver();
    const steamId = randomSteamId64();
    const toInsert = new Ban({steamId64: randomSteamId64(), bannedById64: chance.word(), expiredAt: chance.date()});
    await expect(service.createUpdateBan(toInsert)).rejects.toThrow();
  });

  it('search ban by bannedby', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    const added = await service.createUpdateBan(toInsert);

    const [found, count, pages] = await service.getBans({bannedById64: toInsert.bannedById64});

    expect(count).toEqual(1);

    expect(added).toMatchObject(found[0]);
  });

  it('simple getban', async () => {

    
    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    await service.createUpdateBan(toInsert, );

    const found = await service.getBan({steamId64: toInsert.steamId64, });

    expect(found).toMatchObject(toInsert);
  });

  it('getban not existing', async () => {

    const found = await service.getBan({steamId64: randomSteamId64(), id1: chance.word(), id2: chance.word()});

    expect(found).toBeNull();
  });

  it('udpate ban', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    const added = await service.createUpdateBan(toInsert);

    expect(added).toMatchObject(toInsert);

    const cloned = new Ban({...added});

    const anotherGameServer = await createRandomGameserver();

    added.reason = chance.sentence();
    added.steamId64 = randomSteamId64();
    added.id1 = chance.guid({version: 4});
    added.id2 = chance.guid({version: 4});
    added.gameserver = anotherGameServer;
    added.createdAt = chance.date();
    added.bannedById64 = randomSteamId64();
    added.expiredAt = chance.date();
    added.roundDates(); //make sure date is in the right format to be compared agains db

    const updated = await service.createUpdateBan(added);

    expect(updated.reason).toBe(added.reason);
    expect(updated.steamId64).toBe(cloned.steamId64);
    expect(updated.id1).toBe(cloned.id1);
    expect(updated.id2).toBe(cloned.id2);
    expect(updated.gameserver).toMatchObject(cloned.gameserver);
    expect(updated.bannedById64).toBe(cloned.bannedById64);
    expect(updated.createdAt.valueOf()).toBe(cloned.createdAt.valueOf());
    expect(updated.expiredAt.valueOf()).toBe(added.expiredAt.valueOf());

  });

  
  it('not existing with banlist partners', async () => {

    jest.spyOn(cfgService, "getAppConfig").mockImplementation(async (cached: boolean) =>  new AppConfig({banlistPartners: [chance.url(), chance.url(), chance.url()]}));

    const queryBanlistPartnerForBanMock = async (url: string, steamId64: string, id1?: string, id2?: string) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // simulate request
      return null;
    };

    service.setOverrideBanlistPartnerRequest(queryBanlistPartnerForBanMock);

    const found = await service.getBan({steamId64: randomSteamId64(), queryBanlistPartners: true});
    expect(found).toBeNull();

  });

  it('get ban from banlist partners', async () => {

    const partners = [chance.url(), chance.url(), chance.url()];

    jest.spyOn(cfgService, "getAppConfig").mockImplementation(async (cached: boolean) =>  new AppConfig({banlistPartners: partners}));

    const gameServer = await createRandomGameserver();
    const ban = randomBan(gameServer);
    const ban2 = randomBan(gameServer);

    const queryBanlistPartnerForBanMock = async (url: string, steamId64: string, id1?: string, id2?: string) => {
      
      expect(steamId64).toBe(ban.steamId64);
      expect(id1).toBe(ban.id1);
      expect(id2).toBe(ban.id2);

      await new Promise(resolve => setTimeout(resolve, 500)); // simulate request
      
      if(url === partners[0])
      {
        return ban;
      }

      if(url === partners[1])
      {
        return ban2;
      }
      
      return null;
    };

    service.setOverrideBanlistPartnerRequest(queryBanlistPartnerForBanMock);

    const found = await service.getBan({steamId64: ban.steamId64, id1: ban.id1, id2: ban.id2, queryBanlistPartners: true});
    expect(found).toEqual(ban.expiredAt.valueOf() > ban2.expiredAt.valueOf() ? ban : ban2);

  });


  it('search ban by steamId', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    const added = await service.createUpdateBan(toInsert,);

    const [found, count, pages] = await service.getBans({steamId64: toInsert.steamId64});

    expect(count).toEqual(1);

    expect(added).toMatchObject(found[0]);
  });

  it('search ban by steamId using search', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    const added = await service.createUpdateBan(toInsert, );

    const [found, count, pages] = await service.getBans({search: toInsert.steamId64});

    expect(count).toEqual(1);

    expect(added).toMatchObject(found[0]);
  });

  it('search ban by server using search', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(gameServer);
    const added = await service.createUpdateBan(toInsert,);

    const [found, count, pages] = await service.getBans({search: gameServer.id});

    expect(count).toEqual(1);

    expect(added).toMatchObject(found[0]);
  });

  it('create ban, minimal server', async () => {

    const gameServer = await createRandomGameserver();
    const toInsert = randomBan(new Gameserver({id: gameServer.id}));
    const added = await service.createUpdateBan(toInsert);

    expect(added).toMatchObject(toInsert);

    const found = await service.getBan({id: added.id});

    expect(found.gameserver).toMatchObject(gameServer);
  });

  it('create n bans', async () => {

    const gameServer = await createRandomGameserver();
   
    const insertedBans: Ban[] = [];
   
    //Insert N pseudo random bans
    await forN(async () => {
      const toInsert = randomBan(gameServer);
      insertedBans.push(toInsert);

      await service.createUpdateBan(toInsert);

    });
      
    let [requestedBans, total, pages] = await service.getBans({});    
    expect(requestedBans.length).toBeLessThanOrEqual(MAX_PAGE_SIZE_WITH_STEAMID);
    expect(total).toBe(N);

    //Get all pages and merge them into result archive
    if(requestedBans.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        requestedBans = [...requestedBans, ...(await service.getBans({page: i}))[0]];
      }
    }

    expect(requestedBans.length).toBe(N);

    insertedBans.forEach( x => {
        const other = requestedBans.find(y => keysMatch(y, x));
        expect(other).toBeTruthy();
    });
  });

  it('create n bans, check active count', async () => {

    const gameServer = await createRandomGameserver();
   
    const insertedBans: Ban[] = [];
   
    //Insert N pseudo random bans
    await forN(async (idx) => {
      const toInsert = randomBan(gameServer, 
        {
          expiredAt: idx % 3 == 0 ? randomDateInRange(new Date(1980, 1, 1), new Date(2019, 1, 1)) : randomDateInRange(new Date(2050, 1, 1), new Date(2300, 1, 1))
        });
      insertedBans.push(toInsert);

      await service.createUpdateBan(toInsert);

    });

    const count = insertedBans.filter(x => x.expiredAt.valueOf() > new Date().valueOf()).length;
      
    const countFound = await service.getNumberOfActiveBansCached();

    expect(countFound).toBe(countFound);    
  });

  it('query bans by steam id', async () => {

    const gameServer = await createRandomGameserver();
    const toBeBanned = randomSteamId64();

    const insert = await service.createUpdateBan(randomBan(gameServer, {bannedSteamId: toBeBanned}));
    const insert2 = await service.createUpdateBan(randomBan(gameServer, {bannedSteamId: toBeBanned}));
      
    await service.createUpdateBan(randomBan(gameServer));

    const [res, total] = await service.getBans({steamId64: toBeBanned});

    expect(res.length).toBe(2);
    expect(total).toBe(2);

    expect(res).toContainEqual(insert);
    expect(res).toContainEqual(insert2);
    
  });

  it('query bans by banned by bannedby id', async () => {

    const gameServer = await createRandomGameserver();
    const bannedby = randomSteamId64();

    const insert = await service.createUpdateBan(randomBan(gameServer, {bannedBySteamId: bannedby}));
    const insert2 = await service.createUpdateBan(randomBan(gameServer, {bannedBySteamId: bannedby}));
      
    await service.createUpdateBan(randomBan(gameServer));

    const [res, total] = await service.getBans({ bannedById64: bannedby});

    expect(total).toBe(2);
    expect(res.length).toBe(2);
    expect(res).toContainEqual(insert);
    expect(res).toContainEqual(insert2);
    
  });


  it('sort n bans desc', async () => {

    const gameServer = await createRandomGameserver();
   
    let arr: Ban[] = [];
   
    await forN(async () => {
      const toInsert = randomBan(gameServer);
      toInsert.createdAt = new Date(chance.date({max: new Date()}));
      toInsert.roundDates();
       // remove ms
      arr.push(toInsert);
      await service.createUpdateBan(toInsert);
    });

    arr = arr.sort((x, y) => y.createdAt.valueOf() - x.createdAt.valueOf()); //sorts desc
      
    let [res, total, pages] = await service.getBans({orderDesc: true, orderByExpirationDate: false});    

    expect(total).toBe(N); 

    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getBans({page: i, orderDesc: true, orderByExpirationDate: false}))[0]];
      }
    }

    expect(res.length).toBe(N); 
    
    for(let i = 0; i < N; i++)
    {
      expect(res[i]).toMatchObject(arr[i]); // expect same order
    }
  });

  it('sort n bans not expired', async () => {

    const gameServer = await createRandomGameserver();
   
    let arr: Ban[] = [];
 
    await forN(async (idx) => {

      const toInsert = randomBan(gameServer, {expiredAt: new Date(chance.date(idx < N / 2 ? {year: new Date().getFullYear() + 1} : {year: new Date().getFullYear() - 1}))});

      toInsert.createdAt = new Date(chance.date({max: new Date()}));
      arr.push(toInsert);
      await service.createUpdateBan(toInsert);
    });

    arr = arr.filter(x => x.expiredAt.valueOf() > new Date().valueOf());
      
    let [res, total, pages] = await service.getBans({noExpiredBans: true});   
    
    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getBans({page: i, noExpiredBans: true}))[0]];
      }
    }

    expect(total).toBe(arr.length); 
  
    arr.forEach( x => {
      const other = res.find(y => {
        const res = keysMatch(y, x);
        return res;
      });
      expect(other).toBeTruthy();
    });
  });

  it('pagination get n', async () => {

    const gameServer = await createRandomGameserver();

    let arr: Ban[] = [];
    
    await forN(async () => {
      const toInsert = randomBan(gameServer);
      toInsert.createdAt = new Date(chance.date({max: new Date()}));
      arr.push(toInsert);
      await service.createUpdateBan(toInsert);
    });

    arr = arr.sort((x, y) => x.createdAt.valueOf() - y.createdAt.valueOf()); //sorts asc, db answer is also sorted asc by default
    
    const middle = Math.ceil(Math.min(arr.length / 2, MAX_PAGE_SIZE_WITH_STEAMID))
    const arr2 = arr.slice(middle, Math.min(arr.length, MAX_PAGE_SIZE_WITH_STEAMID * 2));
    arr = arr.slice(0, middle);
    

    const [res, total1] = await service.getBans({pageSize: Math.ceil(Math.min(N/2, MAX_PAGE_SIZE_WITH_STEAMID))}); 
    const [res2, total2] = await service.getBans({pageSize: Math.ceil(Math.min(N/2, MAX_PAGE_SIZE_WITH_STEAMID)), page: 2}); 
    expect(res.length).toBe(arr.length);
    expect(res2.length).toBe(arr2.length);
    expect(total1).toBe(N);
    expect(total2).toBe(N);
    
    arr.forEach( x => {
      const other = res.find(y => keysMatch(y, x));
      expect(other).toBeTruthy();
    });

    arr2.forEach( x => {
      const other = res2.find(y => {
        const found = keysMatch(y, x);
        return found;
      });
      expect(other).toBeTruthy();
    });

  });

  it('insertdelete ban', async () => {

    const gameServer = await createRandomGameserver();

    const arr: Ban[] = [];

    await forN(async () => {
      const toInsert = randomBan(gameServer);
      toInsert.createdAt = new Date(chance.date({max: new Date()}));
      arr.push(await service.createUpdateBan(toInsert));
    });

    const toDelete = arr.slice(0, arr.length / 2);
    const toKeep = arr.slice(arr.length / 2 + 1);

    await asyncForEach(toDelete, async x => await service.deleteBan(x.id));

    await asyncForEach(toDelete, async x => await expect(await service.getBan({id: x.id})).toBeNull());
    await asyncForEach(toKeep, async x => await expect(await service.getBan({id: x.id})).toEqual(x));
  });
  
  
});
