import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { genTypeORMTestCFG, } from '../testUtils';
import { chance } from 'jest-chance';

import _ from 'lodash'
import { AppConfig } from './app-config.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {MIN_PW_LENGTH, } from '../globals';

import testConfiguration from '../testConfiguration';
import * as jwt from 'jsonwebtoken';
import { Role } from '../shared/auth.utils';
import { LoginService } from './login.service';

describe('Login', () => {
  let service: LoginService;
  let module: TestingModule;
  let appCfgService: AppConfigService;
  beforeEach(async () => {  

    process.env.INSTANCE_ID = chance.word();

    module = await Test.createTestingModule({
      imports: [
        genTypeORMTestCFG([AppConfig]), 
        TypeOrmModule.forFeature([AppConfig]),
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
      ],
      providers: [ AppConfigService, ConfigService, LoginService ]
    }).compile();

    appCfgService = module.get<AppConfigService>(AppConfigService);
    service = module.get<LoginService>(LoginService);
  });

  afterEach( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('test successful login ', async () => {
    
    const password = chance.word({length: chance.integer({min: MIN_PW_LENGTH, max: 56})});
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.url()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: password,
        secret: chance.word()
      });

    await appCfgService.createUpdateAppConfig(toInsert);

    const token = await service.login(password);
    const extracted = jwt.decode(token);

    expect(extracted["role"]).toBe(Role.admin);
    
  });

  it('test unsuccessful login ', async () => {
    
    const password = chance.word({length: chance.integer({min: MIN_PW_LENGTH, max: 56})});
    const toInsert = new AppConfig(
      {
        publicStats: chance.bool(), 
        banlistPartners: _.range(chance.integer({min: 0, max: 40})).map(x => chance.url()),
        publicBanQuery: chance.bool(),
        masterserverKey: chance.word(),
        steamWebApiKey: chance.word(),
        password: password,
        secret: chance.word()
      });

    await appCfgService.createUpdateAppConfig(toInsert);

    await expect(service.login(chance.word())).rejects.toThrow();
    
  });
  
});
