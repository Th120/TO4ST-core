import { Test, TestingModule } from '@nestjs/testing';
import { AuthKey } from './auth-key.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { asyncForEach, roundDate } from '../shared/utils';
import { N, genTypeORMTestCFG, forN } from '../testUtils';
import { chance } from 'jest-chance';

import _ from 'lodash'
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAX_PAGE_SIZE, MIN_AUTH_KEY_LENGTH, } from '../globals';
import testConfiguration from '../testConfiguration';
import { AuthKeyService } from './auth-key.service';


describe('AuthKeyService', () => {
  let service: AuthKeyService;
  let module: TestingModule;
  let configService: ConfigService;
  beforeEach(async () => {  

    process.env.INSTANCE_ID = chance.word();

    module = await Test.createTestingModule({
      imports: [
        genTypeORMTestCFG([AuthKey, ]), 
        TypeOrmModule.forFeature([AuthKey, ]),
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
      ],
      providers: [ AuthKeyService, ]
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    service = module.get<AuthKeyService>(AuthKeyService);
  });

  afterEach( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const randomAuthKey =  () => {
    return new AuthKey({authKey: chance.guid({version: 4}), description: chance.sentence(), lastUse: roundDate(chance.date())});
  };


  it('simple create', async () => {
    const toInsert = randomAuthKey();
    const added = await service.createUpdateAuthKey(toInsert);

    expect(added).toMatchObject(toInsert);
  });

  it('create key too short ', async () => {
    const toInsert = new AuthKey({authKey: chance.word({length: chance.integer({min: 3, max: MIN_AUTH_KEY_LENGTH - 1 })})})
    await expect(service.createUpdateAuthKey(toInsert)).rejects.toThrow();
  });

  it('create, auto generate authKey', async () => {
    const toInsert = new AuthKey({});
    const added = await service.createUpdateAuthKey(toInsert);

    expect(added.authKey).toBeDefined();
    expect(added.authKey.length).toBe(MIN_AUTH_KEY_LENGTH);
  });

  it('create, auto set date', async () => {
    const toInsert = new AuthKey({});
    const added = await service.createUpdateAuthKey(toInsert);

    expect(added).toBeDefined();
    expect(added.lastUse.valueOf()).toBeGreaterThan((new Date()).valueOf() - 4000);
  });

  it('get one by id', async () => {

    const toInsert = randomAuthKey();
   
    const added = await service.createUpdateAuthKey(toInsert);
    await expect(await service.getAuthKey({id: added.id})).toMatchObject(toInsert);
  });

  it('get one by key', async () => {

    const toInsert = randomAuthKey();
   
    const added = await service.createUpdateAuthKey(toInsert);
    await expect(await service.getAuthKey({authKey: added.authKey})).toMatchObject(toInsert);
  });

  it('get non exist by id', async () => {
    await expect(await service.getAuthKey({id: 69696969})).toBeUndefined();
  });

  it('get non exist by key', async () => {
    await expect(await service.getAuthKey({authKey: "abc"})).toBeUndefined();
  });

  it('create n', async () => {

    const arr: AuthKey[] = [];

    await forN(async () => {
      const toInsert = randomAuthKey();
     
      arr.push(toInsert);
      await service.createUpdateAuthKey(toInsert);
    });
      
    let [res, total, pages] = await service.getAuthKeys({page: 1, pageSize:N + 1});  
    
    
    if(res.length != total)
    {
      for(let i = 2; i <= pages; i++)
      {
        res = [...res, ...(await service.getAuthKeys({page: i}))[0]];
      }
    }


    expect(res.length).toBe(N);
    expect(total).toBe(N);

    arr.forEach( x => {
        const other = res.find(y => y.authKey === x.authKey);
        expect(other).toMatchObject(x);
    });

  });

  it('pagination get n', async () => {

    let arr: AuthKey[] = [];
    
    await forN(async (idx) => {
      const toInsert = randomAuthKey();
      arr.push(toInsert);
    
      await service.createUpdateAuthKey(toInsert);
    });

    arr = arr.sort((a, b) => b.lastUse.valueOf() - a.lastUse.valueOf()).slice(0, 2 * Math.min(N/2, MAX_PAGE_SIZE));
    const arr2: AuthKey[] = arr.slice(Math.min(N/2, MAX_PAGE_SIZE));
    arr = arr.slice(0, Math.min(N/2, MAX_PAGE_SIZE));
      
    const  [res, total1] = await service.getAuthKeys({ page: 1, pageSize: Math.ceil(N / 2)}); 
    const  [res2, total2] = await service.getAuthKeys({ page: 2, pageSize: Math.ceil(N / 2)}); 

    expect(res.length).toBe(arr.length);
    expect(res2.length).toBe(arr2.length);

    expect(total1).toBe(N);
    expect(total2).toBe(N);

    arr.forEach( x => {
        const other = res.find(y => y.authKey === x.authKey);
        expect(other).toMatchObject(x);
    });

    arr2.forEach( x => {
      const other = res2.find(y => y.authKey === x.authKey);
      expect(other).toMatchObject(x);
    });

  });

  it('delete by id', async () => {
    const toInsert = randomAuthKey();
   
    const added = await service.createUpdateAuthKey(toInsert);

    await service.deleteAuthKey({id: added.id});

    await expect(await service.getAuthKey({id: added.id})).toBeUndefined();
  });

  it('delete by key', async () => {
    const toInsert = randomAuthKey();
   
    const added = await service.createUpdateAuthKey(toInsert);

    await service.deleteAuthKey({authKey: added.authKey});

    await expect(await service.getAuthKey({authKey: added.authKey})).toBeUndefined();
  });

  it('simple update', async () => {
    const toInsert = randomAuthKey();
     
    const added = await service.createUpdateAuthKey(toInsert);

    added.description = chance.sentence();
    added.authKey = chance.guid({version: 4});
    added.lastUse = chance.date();
    added.roundDates();

    await service.createUpdateAuthKey(added);

    const found = await service.getAuthKey({id: added.id});
    expect(found).toMatchObject(added);
  });

  it('simple update from plain', async () => {
    const toInsert = randomAuthKey();
     
    const added = await service.createUpdateAuthKey(toInsert);

    added.description = chance.sentence();
    added.lastUse = chance.date();

    const copy = new AuthKey({...toInsert});
    copy.id = undefined;

    const cleaned = _.pickBy(copy, x => x !== undefined);

    await service.createUpdateAuthKey(copy);
    const found = await service.getAuthKey({id: added.id});

    expect(found).toMatchObject(cleaned);
  });


  it('insertdelete by id', async () => {
    const arr: AuthKey[] = [];

    await forN(async () => {
      const toInsert = randomAuthKey();
      arr.push(await service.createUpdateAuthKey(toInsert));
    });
    
    const toDelete = arr.slice(0, arr.length / 2);
    const toKeep = arr.slice(arr.length / 2 + 1);

    await asyncForEach(toDelete, async x => await service.deleteAuthKey({id: x.id}));

    await asyncForEach(toDelete, async x => await expect(await service.getAuthKey({id: x.id})).toBeUndefined());
    await asyncForEach(toKeep, async x => await expect(await service.getAuthKey({id: x.id})).toMatchObject(x));
  });

  it('insertdelete by key', async () => {
    const arr: AuthKey[] = [];

    await forN(async () => {
      const toInsert = randomAuthKey();
     
      arr.push(toInsert);
      await service.createUpdateAuthKey(toInsert);
    });
    
    const toDelete = arr.slice(0, arr.length / 2);
    const toKeep = arr.slice(arr.length / 2 + 1);

    await asyncForEach(toDelete, async x => await service.deleteAuthKey({authKey: x.authKey}));

    await asyncForEach(toDelete, async x => await expect(await service.getAuthKey({authKey: x.authKey})).toBeUndefined());
    await asyncForEach(toKeep, async x => await expect(await service.getAuthKey({authKey: x.authKey})).toMatchObject(x));
  });

  it('search authKey by description', async () => {
    const arr: AuthKey[] = [];

    await forN(async () => {
      const toInsert = randomAuthKey();
     
      arr.push(toInsert);
      await service.createUpdateAuthKey(toInsert);
    });
    
    const searchFor = arr[chance.integer({min: 0}) % arr.length];

    const [found] = await service.getAuthKeys({search: searchFor.description.slice(Math.ceil(searchFor.description.length / 1.5))});

    expect(found.length).toBeGreaterThanOrEqual(1);

    expect(found.some(x => x.description === searchFor.description)).toBeTruthy();
    
  });

  it('search authKey by authKey', async () => {
    const arr: AuthKey[] = [];

    await forN(async () => {
      const toInsert = randomAuthKey();
     
      arr.push(toInsert);
      await service.createUpdateAuthKey(toInsert);
    });
    
    const searchFor = arr[chance.integer({min: 0}) % arr.length];

    const [found] = await service.getAuthKeys({search: searchFor.authKey.slice(Math.ceil(searchFor.authKey.length / 1.5))});

    expect(found.length).toBeGreaterThanOrEqual(1);

    expect(found.some(x => x.authKey === searchFor.authKey)).toBeTruthy();
    
  });
  
});
