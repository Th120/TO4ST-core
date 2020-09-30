import { Test, TestingModule } from '@nestjs/testing';

import { TypeOrmModule } from '@nestjs/typeorm';


import { asyncForEach, } from '../shared/utils';
import { chance } from 'jest-chance'; 
import { forN, N, randomSteamId64, genTypeORMTestCFG, MIN_N, randomSteamId64s  } from '../testUtils';

import { RegisteredPlayer } from './registered-player.entity';
import _ from 'lodash'

import { SteamUserService } from '../core/steam-user.service';


import { SteamUser } from '../core/steam-user.entity';

import { RegisteredPlayerService } from './registered-player.service';
import { AppConfigService } from '../core/app-config.service';
import { AppConfig } from '../core/app-config.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import testConfiguration from '../testConfiguration';



describe('RegisteredPlayerService', () => {
  let service: RegisteredPlayerService;
  let module: TestingModule;
  beforeEach(async () => { 
    module = await Test.createTestingModule({
      imports: [ 
        genTypeORMTestCFG([RegisteredPlayer, SteamUser, AppConfig]), 
        TypeOrmModule.forFeature([RegisteredPlayer, SteamUser, AppConfig],), 
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
      ], 
      providers: [SteamUserService, ConfigService, RegisteredPlayerService, AppConfigService]
    }).compile();

    service =  module.get<RegisteredPlayerService>(RegisteredPlayerService);
  });

  afterEach( async () => {
    await module.close();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const randomRegisteredPlayer = () => {
    return new RegisteredPlayer({steamId64: randomSteamId64(), 
      rootAdmin: chance.bool(), gameControl: chance.bool(), makeTeams: chance.bool(), ban: chance.bool(), 
      kick: chance.bool(), tempKickBan: chance.bool(), mute: chance.bool(), broadcastMessage: chance.bool(), reservedSlots: chance.bool()});
  }

  const randomRegisteredPlayers = (num: number) => {
    return randomSteamId64s({count: num, seed: chance.integer()}).map(x => new RegisteredPlayer({steamId64: x, 
      rootAdmin: chance.bool(), gameControl: chance.bool(), makeTeams: chance.bool(), ban: chance.bool(), 
      kick: chance.bool(), tempKickBan: chance.bool(), mute: chance.bool(), broadcastMessage: chance.bool(), reservedSlots: chance.bool()}));
  }

    
  it('create registered player', async () => {
    const toInsert = randomRegisteredPlayer();
    const added = await service.createUpdateRegisteredPlayer(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  it('create registered player, invalid steamId', async () => {
    const toInsert = randomRegisteredPlayer();
    toInsert.steamId64 = chance.word();
    await expect(service.createUpdateRegisteredPlayer(toInsert)).rejects.toThrow();
  });

  it('get one player', async () => {

    const toInsert = randomRegisteredPlayer();
    const added = await service.createUpdateRegisteredPlayer(toInsert);

    await expect(await service.getRegisteredPlayer({steamId64: added.steamId64})).toMatchObject(toInsert);
  });

  it('get non exist player', async () => {
    await expect(await service.getRegisteredPlayer({steamId64: randomSteamId64()})).toBeUndefined();
  });
  
  it('create n players', async () => {

    const arr: RegisteredPlayer[] = randomRegisteredPlayers(N);
    await forN(async (idx) => {
      await service.createUpdateRegisteredPlayer(arr[idx]);
    });
      
    let [res, total, pages] = await service.getRegisteredPlayers({});    
    expect(total).toBe(N);
    
    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getRegisteredPlayers({page: i}))[0]];
      }
    }

    arr.forEach( x => {
        const other = res.find(y => y.steamId64 === x.steamId64);
        expect(other).toMatchObject(x);
    });

  });

  it('create n players check pagesize', async () => {

    const arr: RegisteredPlayer[] = randomRegisteredPlayers(N);
    await forN(async (idx) => {
      await service.createUpdateRegisteredPlayer(arr[idx]);
    });

    const pageSize = MIN_N;
      
    const [res, total, pages] = await service.getRegisteredPlayers({pageSize: pageSize});    
    expect(total).toBe(N);
    expect(res.length).toBe(pageSize);
    expect(pages).toBe(Math.ceil(total / pageSize))

  });

  it('simple delete player', async () => {
    const toInsert = randomRegisteredPlayer();
   
    const added = await service.createUpdateRegisteredPlayer(toInsert);

    await service.deleteRegisteredPlayer({steamId64: added.steamId64});

    await expect(await service.getRegisteredPlayer({steamId64: added.steamId64})).toBeUndefined();
  });

  it('simple update player', async () => {
    const toInsert = new RegisteredPlayer({steamId64: randomSteamId64()});
     
    const added = await service.createUpdateRegisteredPlayer(toInsert);

    added.mute = true;
    added.gameControl = true;

    await service.createUpdateRegisteredPlayer(added);

    await expect(await service.getRegisteredPlayer({steamId64: added.steamId64})).toMatchObject(added);
  });

  it('update player from plain', async () => {
    const toInsert = new RegisteredPlayer({steamId64: randomSteamId64()});
     
    const added = await service.createUpdateRegisteredPlayer(toInsert);

    added.mute = true;
    added.gameControl = true;

    const copy = new RegisteredPlayer({...added});
    copy.id = undefined;

    const cleaned = _.pickBy(copy, x => x !== undefined);

    await service.createUpdateRegisteredPlayer(copy);

    const updated = await service.getRegisteredPlayer({steamId64: added.steamId64});

    expect(updated).toMatchObject(cleaned);
  });


  it('insertdelete player', async () => {
    const arr: RegisteredPlayer[] = [];

    const toInsert = randomRegisteredPlayers(N);
    await forN(async (idx) => {
      arr.push(await service.createUpdateRegisteredPlayer(toInsert[idx]));
    });
    
    const toDelete = arr.slice(0, arr.length / 2);
    const toKeep = arr.slice(arr.length / 2 + 1);

    await asyncForEach(toDelete, async x => await service.deleteRegisteredPlayer({steamId64: x.steamId64}));

    await asyncForEach(toDelete, async x => await expect(await service.getRegisteredPlayer({steamId64: x.steamId64})).toBeUndefined());
    await asyncForEach(toKeep, async x => await expect(await service.getRegisteredPlayer({steamId64: x.steamId64})).toEqual(x));
  });

  
  
});
