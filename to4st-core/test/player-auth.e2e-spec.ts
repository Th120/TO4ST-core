import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { hashPassword, TIMEOUT_PROMISE_FACTORY } from '../src/shared/utils';
import { chance } from 'jest-chance';

import * as jwt from 'jsonwebtoken';
import { Role, AuthPlayerRole } from '../src/shared/auth.utils';
import { randomSteamId64, randomSteamId64s } from '../src/testUtils';
import { RegisteredPlayer } from '../src/gameserver/registered-player.entity';


describe('player auth (e2e)', () => {
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


    it('authPlayerToken', async  () => {
      const token = await authPlayerToken(new RegisteredPlayer({steamId64: randomSteamId64(), ban: true, rootAdmin: true}));
      const decoded = jwt.decode(token) as any;
      expect(decoded.role).toBe(Role.authPlayer);
      expect(decoded.authPlayerRoles).toContain(AuthPlayerRole.rootAdmin);
      expect(decoded.authPlayerRoles).toContain(AuthPlayerRole.ban);
    });

    it('authPlayerToken no roles', async  () => {
      const token = await authPlayerToken(new RegisteredPlayer({steamId64: randomSteamId64(),}));
      const decoded = jwt.decode(token) as any;
      expect(decoded.role).toBe(Role.authPlayer);
      expect(decoded.authPlayerRoles.length).toBe(0);
    });
  
});
