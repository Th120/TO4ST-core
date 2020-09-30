import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { hashPassword, TIMEOUT_PROMISE_FACTORY } from '../src/shared/utils';
import { chance } from 'jest-chance';

import * as jwt from 'jsonwebtoken';
import { Role } from '../src/shared/auth.utils';

describe('Login (e2e)', () => {
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


  it('login', async  () => {
    const token = await login();
    const decoded = jwt.decode(token) as any;
    expect(decoded.role).toBe(Role.admin);
  });

  it('login invalid', async  () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        mutation 
        {  
          login(password: "${chance.word()}") 
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
      }).expect((res) => {
        const ext = JSON.parse(res.text).errors[0].extensions;
        expect(ext.exception.status).toBe(HttpStatus.FORBIDDEN);
      });
  });
});
