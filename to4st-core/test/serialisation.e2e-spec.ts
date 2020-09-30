import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { hashPassword, TIMEOUT_PROMISE_FACTORY } from '../src/shared/utils';
import { chance } from 'jest-chance';

import * as jwt from 'jsonwebtoken';
import { Role } from '../src/shared/auth.utils';

describe('Serialisation (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.E2E_PW_OVERRIDE = chance.word(); // set pw for this test instance

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

 

  const bearer = (token: string) => `Bearer ${token}`;

  const login = async () => 
    {     
      const resultLogin = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {  
          login(password: "${hashPassword(process.env.E2E_PW_OVERRIDE)}") 
          {
            jwt
            appConfig {      
              instanceId   
              publicStats      
              publicBanQuery      
              banlistPartners      
              masterserverKey    
            }  
          }
        }`,
        
      });

      const jwt = resultLogin.body.data.login.jwt;

      return jwt;
    };

  it('get appconfig, logged in', async  () => {

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `{
          appConfig 
          {
            instanceId
            publicStats
            publicBanQuery
            banlistPartners
            masterserverKey
            appInfo {
              gamesPlayed
              roundsPlayed
              uniquePlayers
              activeBans
            }
          }
        }`,
      }).set("Authorization", bearer(token))
      .expect(async (res) => {
        const appCfg = res.body.data.appConfig;
        expect(appCfg.instanceId).toBeDefined();
        expect(appCfg.banlistPartners).toBeDefined();
        expect(appCfg.masterserverKey).toBe("");
        expect(appCfg.appInfo.gamesPlayed).toBeGreaterThanOrEqual(0);
        expect(appCfg.appInfo.roundsPlayed).toBeGreaterThanOrEqual(0);
        expect(appCfg.appInfo.uniquePlayers).toBeGreaterThanOrEqual(0);
        expect(appCfg.appInfo.activeBans).toBeGreaterThanOrEqual(0);
      });
  });
 
   it('get appconfig, not logged, should be filtered by admin role', async () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `{
          appConfig 
          {
            instanceId
            publicStats
            publicBanQuery
            banlistPartners
            masterserverKey
            appInfo {
              gamesPlayed
              roundsPlayed
              uniquePlayers
              activeBans
            }
          }
        }`,
        
      }).expect(async (res) => {
        const appCfg = res.body.data.appConfig;
        expect(appCfg.instanceId).toBeNull();
        expect(appCfg.banlistPartners).toBeNull();
        expect(appCfg.masterserverKey).toBeNull();
        expect(appCfg.appInfo.gamesPlayed).toBeGreaterThanOrEqual(0);
        expect(appCfg.appInfo.roundsPlayed).toBeGreaterThanOrEqual(0);
        expect(appCfg.appInfo.uniquePlayers).toBeGreaterThanOrEqual(0);
        expect(appCfg.appInfo.activeBans).toBeGreaterThanOrEqual(0);
      });
  });



});
