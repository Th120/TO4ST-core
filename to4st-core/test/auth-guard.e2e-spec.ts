import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { hashPassword, TIMEOUT_PROMISE_FACTORY, } from '../src/shared/utils';
import { chance } from 'jest-chance';

import { randomSteamId64 } from '../src/testUtils';
import { RegisteredPlayer } from '../src/gameserver/registered-player.entity';

describe('Auth guard (e2e)', () => {
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

    const getAuthKey = async () =>  {
      const token = await login();
      
      const resultAuthKey = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          createUpdateAuthKey(authKey: {})
          {
            authKey
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", chance.guid({version: 4}));

      const key = resultAuthKey.body?.data?.createUpdateAuthKey?.authKey;
      expect(key).toBeDefined();
      return key;
    };

    const getGameserverAuthKey = async () =>  {
      const token = await login();
      
      const resultAuthKey = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          createUpdateGameserver(gameserver: {description: "${chance.sentence()}"})
          {
            authKey
          }
        }`,
      }).set("Authorization", bearer(token))
      .set("X-Request-ID", chance.guid({version: 4}));

      const key = resultAuthKey.body?.data?.createUpdateGameserver?.authKey;
      expect(key).toBeDefined();
      return key;
    };

    const authPlayerToken = async (player: RegisteredPlayer) => 
  {     
    const token = await login();

    const resultRegisteredPlayer = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables: {registeredPlayer: player},
      query: `
      mutation CreateRegisteredPlayer($registeredPlayer: RegisteredPlayerInput!) 
      {  
        createUpdateRegisteredPlayer(registeredPlayer: $registeredPlayer) 
        {
          steamId64
        }
      }`,
      
    }).set("Authorization", bearer(token));
    
    const responseJwt = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables: {registeredPlayer: player},
      query: `
      mutation 
      {  
        authPlayerToken(steamId64: "${resultRegisteredPlayer.body.data.createUpdateRegisteredPlayer.steamId64}")
      }`,
      
    }).set("Authorization", bearer(token));;

    return responseJwt.body.data.authPlayerToken;
  };


  it('delete registered player, no auth', async  () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation  
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      }).expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.FORBIDDEN);
      });
  });


  it('default auth restriction at least AuthKey/Gameserver role, delete registered player, with authKey', async  () => {

    const authKey = await getAuthKey();

    const result = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      }).set("Authorization", `AuthKey ${authKey}`)
      .expect((res) => {
        const result = res.body?.data?.deleteRegisteredPlayer;
        expect(result).toBeTruthy();
      });

    await TIMEOUT_PROMISE_FACTORY(2500)[0];

    return result;
  });

  it('default auth restriction at least AuthKey/Gameserver role, delete registered player, no auth', async  () => {

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      })
      .expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('default auth restriction at least AuthKey/Gameserver role, delete registered player, with gameserverAuthKey', async  () => {

    const authKey = await getGameserverAuthKey();

    const result = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      }).set("Authorization", `Gameserver ${authKey}`)
      .expect((res) => {
        const result = res.body?.data?.deleteRegisteredPlayer;
        expect(result).toBeTruthy();
      });

      await TIMEOUT_PROMISE_FACTORY(1000)[0];

      return result;
  });

  it('minRole decorator, none role check for admin auth', async  () => {

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        query {
          authValid
        }`,
      })
      .expect((res) => {
        const result = res.body?.data?.authValid;
        expect(result).toBe(false);
      });
  });

  it('minRole decorator, admin role check for admin auth', async  () => {

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        query {
          authValid
        }`,
      }).set("Authorization", bearer(token))
      .expect((res) => {
        const result = res.body?.data?.authValid;
        expect(result).toBeTruthy();
      });
  });

  it('onlyRole decorator, none role, delete random gameserver', async  () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation {
          deleteGameserver(gameserverId: "${chance.integer({min: 1, max: 100000000})}")
        } `,
      })
      .expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  it('onlyRole decorator, admin role, delete random gameserver', async  () => {

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation {
          deleteGameserver(gameserverId: "${chance.integer({min: 1, max: 100000000})}")
        } `,
      }).set("Authorization", bearer(token))
      .expect((res) => {
        const result = res.body?.data?.deleteGameserver;
        expect(result).toBeTruthy();
      });
  });

  it('wrong authorization format', async  () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation {
          deleteAuthKey(authKey: "${chance.guid({version: 4})}")
        } `,
      }).set("Authorization", chance.word())
      .expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  it('wrong gameserver authKey', async  () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation {
          deleteAuthKey(authKey: "${chance.guid({version: 4})}")
        } `,
      }).set("Authorization", `Gameserver ${chance.word()}`)
      .expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  it('wrong authKey', async  () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation {
          deleteAuthKey(authKey: "${chance.guid({version: 4})}")
        } `,
      }).set("Authorization", `AuthKey ${chance.word()}`)
      .expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });


  it('delete random registered player, with authPlayerRole rootAdmin', async  () => {

    const token = await authPlayerToken(new RegisteredPlayer({steamId64: randomSteamId64(), rootAdmin: true}));

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      }).set("Authorization", bearer(token))
      .expect((res) => {
        const result = res.body?.data?.deleteRegisteredPlayer;
        expect(result).toBeTruthy();
      });
  });

  it('delete random registered player, with authPlayerRole ban', async  () => {

    const token = await authPlayerToken(new RegisteredPlayer({steamId64: randomSteamId64(), ban: true}));

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      }).set("Authorization", bearer(token))
      .expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.FORBIDDEN);
      });
  });

  it('delete random registered player, with normal login', async  () => {

    const token = await login();

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {
          deleteRegisteredPlayer(steamId64: "${randomSteamId64()}")
        }`,
      }).set("Authorization", bearer(token))
      .expect((res) => {
        const result = res.body?.data?.deleteRegisteredPlayer;
        expect(result).toBeTruthy();
      });
  });


});
