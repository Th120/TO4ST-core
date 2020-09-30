import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { genTypeORMTestCFG, } from '../testUtils';
import { chance } from 'jest-chance';

import _ from 'lodash'
import { AppConfig } from './app-config.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {MIN_PW_LENGTH, MAX_PW_LENGTH } from '../globals';
import * as bcrypt from 'bcrypt';
import testConfiguration from '../testConfiguration';


describe('AppConfigService', () => {
  let service: AppConfigService;
  let module: TestingModule;
  let configService: ConfigService;
  beforeEach(async () => {  

    process.env.INSTANCE_ID = chance.word();

    module = await Test.createTestingModule({
      imports: [
        genTypeORMTestCFG([AppConfig]), 
        TypeOrmModule.forFeature([AppConfig]),
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
      ],
      providers: [ AppConfigService, ConfigService ]
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    service = module.get<AppConfigService>(AppConfigService);
  });

  afterEach( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

   it('create get appcfg', async () => {
    
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.url()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: chance.word({length: chance.integer({min: MIN_PW_LENGTH, max: 56})}),
        secret: chance.word()
      });

    const added = await service.createUpdateAppConfig(toInsert);

    expect(added.passwordInitialised).toBeTruthy();

    toInsert.passwordInitialised = true;

    const validPass = await bcrypt.compare(toInsert.password, added.password);

    expect(validPass).toBeTruthy();

    //password already checked
    toInsert.password = "";
    added.password = "";

    expect(added).toMatchObject(toInsert);
  });

  it('get appcfg after init', async () => {
    
    await service.initAppConfig();

    const found = await service.getAppConfig();
    expect(found.instanceId).toBe(process.env.INSTANCE_ID);
    
  });

  it('get appcfg after init, cached', async () => {
    
    await service.initAppConfig();

    const found = await service.getAppConfig(true);
    expect(found.instanceId).toBe(process.env.INSTANCE_ID);
    
  });

  it('create get appcfg short pw', async () => {
    
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.url()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: chance.word({length: chance.integer({min: 0, max: MIN_PW_LENGTH-1})}),
        secret: chance.word()
      });

    await expect(service.createUpdateAppConfig(toInsert)).rejects.toThrow();
    
  });

  it('create get appcfg long pw', async () => {
    
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.url()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: chance.word({length: chance.integer({min: MAX_PW_LENGTH + 1, max: 300})}),
        secret: chance.word()
      });

    await expect(service.createUpdateAppConfig(toInsert)).rejects.toThrow();
    
  });

  it("create get appcfg, banlist partners forbidden ',' used", async () => {
    
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 2, max: 40})).map(x => chance.url() + " ,"),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: chance.word({length: chance.integer({min: MIN_PW_LENGTH, max: MAX_PW_LENGTH - 1})}),
        secret: chance.word()
      });

    await expect(service.createUpdateAppConfig(toInsert)).rejects.toThrow();
    
  });

  it("create get appcfg, banlist partners forbidden wrong urls", async () => {
    
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.word()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: chance.word({length: chance.integer({min: MAX_PW_LENGTH + 1, max: 300})}),
        secret: chance.word()
      });

    await expect(service.createUpdateAppConfig(toInsert)).rejects.toThrow();
    
  });


  it('create update appcfg', async () => {
    
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.url()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: chance.word({length: chance.integer({min: MIN_PW_LENGTH, max: 56})}),
        secret: chance.word()
      });

    const added = await service.createUpdateAppConfig(toInsert);

    added.publicStats = chance.bool(); 
    added.banlistPartners = _.range(chance.integer({min: 0, max: 40})).map(x => chance.url());
    added.publicBanQuery = chance.bool();
    added.masterserverKey = chance.word();
    added.steamWebApiKey = chance.word();
    added.password = chance.word({length: chance.integer({min: MIN_PW_LENGTH, max: 56})})

    const updated = await service.createUpdateAppConfig(added);
    
    expect(updated.passwordInitialised).toBeTruthy();

    const validPass = await bcrypt.compare(added.password, updated.password);

    expect(validPass).toBeTruthy();

    //password already checked
    updated.password = "";
    added.password = "";

    expect(updated).toMatchObject(added);

  });
  
});
