import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { hashPassword } from '../src/shared/utils';
import { chance } from 'jest-chance';

describe('public stats interceptor(e2e)', () => {
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

    const setPublicStats = async (enable: boolean) => 
    {     
      const token = await login();
      const resultLogin = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {  
          updateAppConfig(appConfig: {publicStats: ${enable}}) 
          {
            publicStats
          }
        }`,
        
      }).set("Authorization", bearer(token));

      const isEnabled = resultLogin.body.data.updateAppConfig.publicStats;

      expect(isEnabled).toBe(enable);
    };

  it('get stats list, public disabled, admin role', async  () => {

    await setPublicStats(false);

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `{
          playerStatistics(options: {}) 
          {
            content
              {
                steamId64
              }
          }
        }`,
      }).set("Authorization", bearer(token))
      .expect(async (res) => {
        const content = res.body.data.playerStatistics?.content;
        expect(content).toBeDefined();
      });
  });

  it('get stats list, public disabled, none role', async  () => {

    await setPublicStats(false);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `{
          playerStatistics(options: {}) 
          {
            content
              {
                steamId64
              }
            }
          }`,
      })
      .expect(async (res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('get stats list, public enabled, admin role', async  () => {

    await setPublicStats(true);

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `{
          playerStatistics(options: {}) 
          {
            content
              {
                steamId64
              }
            }
          }`,
      }).set("Authorization", bearer(token))
      .expect(async (res) => {
        const content = res.body.data.playerStatistics?.content;
        expect(content).toBeDefined();
      });
  });

  it('get stats list, public enabled, none role', async  () => {

    await setPublicStats(true);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `{
          playerStatistics(options: {}) 
          {
            content
              {
                steamId64
              }
            }
          }`,
      })
      .expect(async (res) => {
        const content = res.body.data.playerStatistics?.content;
        expect(content).toBeDefined();
      });
  });

});
