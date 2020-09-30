import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { hashPassword } from '../src/shared/utils';
import { chance } from 'jest-chance';


describe('Transaction (e2e)', () => {
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


  it('set authkey no transactionid', async  () => {

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `mutation { 
          createUpdateAuthKey(authKey: {description: "${chance.sentence()}"}) 
          {
            id
            authKey
            description
            lastUse
          }
        }`,
      }).set("Authorization", bearer(token))
      .expect(async (res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.PRECONDITION_FAILED);
      });
  });

  it('set authkey with transactionid', async  () => {

    const id = chance.guid({version: 4});

    const token = await login();
    const description = chance.sentence();
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `mutation { 
          createUpdateAuthKey(authKey: {description: "${description}"}) 
          {
            id
            authKey
            description
            lastUse
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", id)
      .expect(async (res) => {
        const authKey = res.body.data.createUpdateAuthKey;
        expect(authKey.id).toBeGreaterThanOrEqual(1);
        expect(authKey.authKey).toBeDefined;
        expect(authKey.description).toBe(description);
        expect(authKey.lastUse).toBeDefined();
      });

  });

  it('set authkey with transactionid, re-use id', async  () => {

    const id = chance.guid({version: 4});

    const token = await login();
    const description = chance.sentence();
    const first = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `mutation { 
          createUpdateAuthKey(authKey: {description: "${description}"}) 
          {
            id
            authKey
            description
            lastUse
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", id);
      
      const authKey = first.body.data.createUpdateAuthKey;
      expect(authKey.id).toBeGreaterThanOrEqual(1);
      expect(authKey.authKey).toBeDefined;
      expect(authKey.description).toBe(description);
      expect(authKey.lastUse).toBeDefined();

      const second = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `mutation { 
          createUpdateAuthKey(authKey: {description: "${description}"}) 
          {
            id
            authKey
            description
            lastUse
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", id);

      const authKey2 = second.body.data.createUpdateAuthKey;
      expect(authKey2).toMatchObject(authKey);
  });

  it('set authkey with transactionid, re-use id after error', async  () => {

    const id = chance.guid({version: 4});

    const token = await login();
    const description = chance.sentence();
    const first = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `mutation { 
          createUpdateAuthKey(authKey: {authKey: "${chance.word({length: chance.integer({min: 4, max: 20})})}"}) 
          {
            id
            authKey
            description
            lastUse
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", id);

      const ext = JSON.parse(first.text).errors[0].extensions;
      expect(ext.exception.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `mutation { 
          createUpdateAuthKey(authKey: {description: "${description}"}) 
          {
            id
            authKey
            description
            lastUse
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", id)
      .expect(async (res) => {
        const authKey = res.body.data.createUpdateAuthKey;
        expect(authKey.id).toBeGreaterThanOrEqual(1);
        expect(authKey.authKey).toBeDefined;
        expect(authKey.description).toBe(description);
        expect(authKey.lastUse).toBeDefined();
      });

  });

 


});
