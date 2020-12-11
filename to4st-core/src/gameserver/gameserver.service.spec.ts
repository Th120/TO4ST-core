import { Test, TestingModule } from '@nestjs/testing';
import { GameserverConfigOrder, GameserverService } from './gameserver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gameserver } from './gameserver.entity';

import { asyncForEach, } from '../shared/utils';
import { chance } from 'jest-chance'; 
import { forN, N, genTypeORMTestCFG, MIN_N,  } from '../testUtils';

import _ from 'lodash'
import { MIN_AUTH_KEY_LENGTH, MIN_ID_LENGTH } from '../globals';
import { GameserverConfig } from './gameserver-config.entity';
import { GameMode } from '../game-statistics/game-mode.entity';
import { MatchConfig } from './match-config.entity';


describe('GameserverService', () => {
  let service: GameserverService;
  let module: TestingModule;
  beforeEach(async () => { 
    module = await Test.createTestingModule({
      imports: [ 
        genTypeORMTestCFG([Gameserver, GameserverConfig, MatchConfig, GameMode]), 
        TypeOrmModule.forFeature([Gameserver, GameserverConfig, MatchConfig, GameMode],), 
       
      ], 
      providers: [GameserverService, ]
    }).compile();

    service = module.get<GameserverService>(GameserverService);

  });

  afterEach( async () => {
    await module.close();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const randomGameserver = () => {
    return new Gameserver({currentName: chance.word({ length: 32 }), authKey: chance.guid({version: 4}), description: chance.sentence()});
  };


  it('create gameserver', async () => {
    const toInsert = randomGameserver();
    const added = await service.createUpdateGameserver(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  it('create gameserver, no authKey', async () => {
    const toInsert =  new Gameserver({});
    const added = await service.createUpdateGameserver(toInsert);

    expect(added.authKey.length).toBe(MIN_AUTH_KEY_LENGTH);
  });

  it('create gameserver, authKey too short', async () => {
    const toInsert =  new Gameserver({authKey: chance.string({ length: chance.integer({min: 1, max: MIN_AUTH_KEY_LENGTH - 1}) })});

    await expect(service.createUpdateGameserver(toInsert)).rejects.toThrow();
  });

  it('create gameserver, id too short', async () => {
    const toInsert =  new Gameserver({id: chance.string({ length: chance.integer({min: 1, max: MIN_ID_LENGTH - 1}) })});

    await expect(service.createUpdateGameserver(toInsert)).rejects.toThrow();
  });

  it('create gameserver, check lastContact', async () => {
    const toInsert =  new Gameserver({});
    const added = await service.createUpdateGameserver(toInsert);

    expect(added.lastContact.valueOf()).toBeGreaterThan((new Date).valueOf() - 5000);
  });

  it('get one gameserver', async () => {

    const toInsert = randomGameserver();
    const added = await service.createUpdateGameserver(toInsert);
    await expect(await service.getGameserver({id: added.id})).toMatchObject(toInsert);
  });

  it('get non exist gameserver', async () => {
    await expect(await service.getGameserver({id: "blah"})).toBeUndefined();
  });
  
  it('create n gameservers', async () => {

    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
     
      arr.push(toInsert);
      await service.createUpdateGameserver(toInsert);
    });
      
    let [res, total, pages] = await service.getGameservers({orderBy: GameserverConfigOrder.currentName});    
    expect(total).toBe(N);

    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getGameservers({page: i, orderBy: GameserverConfigOrder.currentName}))[0]];
      }
    }

    expect(res.length).toBe(N);

    arr.forEach( x => {
        const other = res.find(y => y.authKey === x.authKey);
        expect(other).toMatchObject(x);
    });

  });

  it('create n check pages', async () => {

    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
     
      arr.push(toInsert);
      await service.createUpdateGameserver(toInsert);
    });
      
    const pageSize = MIN_N;
    const [res, total, pages] = await service.getGameservers({pageSize: pageSize});    
    
    expect(total).toBe(N);
    expect(total).toBe(N);
    expect(res.length).toBe(pageSize);
    expect(pages).toBe(Math.ceil(total / pageSize))
    
  });

  it('delete gameserver by Id', async () => {
    const toInsert = randomGameserver();
   
    const added = await service.createUpdateGameserver(toInsert);

    await service.deleteGameserver({id: added.id});

    await expect(await service.getGameserver({id: added.id})).toBeUndefined();
  });

  it('delete gameserver by authKey', async () => {
    const toInsert = randomGameserver();
   
    const added = await service.createUpdateGameserver(toInsert);

    await service.deleteGameserver({authKey: added.authKey});

    await expect(await service.getGameserver({authKey: added.authKey})).toBeUndefined();
  });

  it('update gameserver', async () => {
    const toInsert = randomGameserver();
     
    const added = await service.createUpdateGameserver(toInsert);

    added.currentName = chance.sentence();
    added.authKey = chance.guid({version: 4});
    added.lastContact = chance.date();
    added.roundDates();

    await service.createUpdateGameserver(added);

    await expect(await service.getGameserver({id: added.id})).toMatchObject(added);
  });

  it('insertdelete gameserver', async () => {
    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
      arr.push(await service.createUpdateGameserver(toInsert));
    });
    
    const toDelete = arr.slice(0, arr.length / 2);
    const toKeep = arr.slice(arr.length / 2 + 1);

    await asyncForEach(toDelete, async x => await service.deleteGameserver({id: x.id}));

    await asyncForEach(toDelete, async x => await expect(await service.getGameserver({id: x.id})).toBeUndefined());
    await asyncForEach(toKeep, async x => await expect(await service.getGameserver({id: x.id})).toEqual(x));
  });

  it('search gameservers by description', async () => {
    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
      arr.push(await service.createUpdateGameserver(toInsert));
    });
    
    const searchFor = arr[chance.integer({min: 0}) % arr.length];

    const [found] = await service.getGameservers({search: searchFor.description.slice(Math.ceil(searchFor.description.length / 1.5)).toLowerCase()});

    expect(found.length).toBeGreaterThanOrEqual(1);

    expect(found.some(x => x.description === searchFor.description)).toBeTruthy();
  });

  it('search gameservers by authKey', async () => {
    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
      arr.push(await service.createUpdateGameserver(toInsert));
    });
    
    const searchFor = arr[chance.integer({min: 0}) % arr.length];

    const [found] = await service.getGameservers({search: searchFor.authKey.slice(Math.ceil(searchFor.authKey.length / 1.5)).toLowerCase()});

    expect(found.length).toBeGreaterThanOrEqual(1);

    expect(found.some(x => x.authKey === searchFor.authKey)).toBeTruthy();
  });

  it('search gameservers by currentName', async () => {
    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
      arr.push(await service.createUpdateGameserver(toInsert));
    });
    
    const searchFor = arr[chance.integer({min: 0}) % arr.length];

    const [found] = await service.getGameservers({search: searchFor.currentName.slice(Math.ceil(searchFor.currentName.length / 1.5)).toLowerCase()});

    expect(found.length).toBeGreaterThanOrEqual(1);

    expect(found.some(x => x.currentName === searchFor.currentName)).toBeTruthy();
  });


  it('get gameservers order by currentName', async () => {

    const arr: Gameserver[] = [];

    await forN(async () => {
      const toInsert = randomGameserver();
     
      arr.push(toInsert);
      await service.createUpdateGameserver(toInsert);
    });
      
    let [res, total, pages] = await service.getGameservers({orderBy: GameserverConfigOrder.currentName});    
    expect(total).toBe(N);

    //Get all pages and merge them into result archive
    if(res.length != total) 
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getGameservers({page: i, orderBy: GameserverConfigOrder.currentName}))[0]];
      }
    }

    const sortedOriginal = arr.sort((x, y) => y.currentName.toLowerCase().localeCompare(x.currentName.toLowerCase()) );

    sortedOriginal.forEach((x, idx) => {
      expect(res[idx]).toMatchObject(x);
    });

  });


  
  
});
