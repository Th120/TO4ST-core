import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from '../core/app-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { genTypeORMTestCFG, randomSteamId64, } from '../testUtils';
import { chance } from 'jest-chance';

import _ from 'lodash'
import { AppConfig } from '../core/app-config.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

import testConfiguration from '../testConfiguration';
import * as jwt from 'jsonwebtoken';
import { Role, AuthPlayerRole } from '../shared/auth.utils';
import { RegisteredPlayerService, IRegisteredPlayerIdentifier } from './registered-player.service';
import { RegisteredPlayer } from './registered-player.entity';
import { PlayerAuthService } from './player-auth.service';
import { SteamUser } from '../core/steam-user.entity';
import { SteamUserService } from '../core/steam-user.service';

describe('PlayerAuthService', () => {
  let service: PlayerAuthService;
  let regPlayerService: RegisteredPlayerService;
  let module: TestingModule;
  let appCfgService: AppConfigService;
  let secret = chance.guid({version: 4});

  const randomRegisteredPlayer = (options?: {ban?: boolean, rootAdmin?: boolean}) => {
    return new RegisteredPlayer({steamId64: randomSteamId64(), 
      rootAdmin: !!options?.rootAdmin || chance.bool(), gameControl: chance.bool(), makeTeams: chance.bool(), ban: !!options?.ban || chance.bool(), 
      kick: chance.bool(), tempKickBan: chance.bool(), mute: chance.bool(), broadcastMessage: chance.bool(), reservedSlots: chance.bool()});
  }

  beforeEach(async () => {  

    process.env.INSTANCE_ID = chance.word();

    module = await Test.createTestingModule({
      imports: [
        genTypeORMTestCFG([AppConfig, RegisteredPlayer, SteamUser]), 
        TypeOrmModule.forFeature([AppConfig, RegisteredPlayer, SteamUser]),
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
      ],
      providers: [ AppConfigService, ConfigService, PlayerAuthService, RegisteredPlayerService, SteamUserService ]
    }).compile();

    appCfgService = module.get<AppConfigService>(AppConfigService);
    regPlayerService = module.get<RegisteredPlayerService>(RegisteredPlayerService);
    service = module.get<PlayerAuthService>(PlayerAuthService);

    jest.spyOn(appCfgService, "getAppConfig").mockImplementation(async (cached: boolean) =>  new AppConfig({secret: secret}));

  });

  afterEach( async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('test simple player auth', async () => {
    
    const currPlayer = randomRegisteredPlayer();

    jest.spyOn(regPlayerService, "getRegisteredPlayer").mockImplementation(async (options: IRegisteredPlayerIdentifier) => currPlayer);

    const token = await service.generateAuthPlayerToken(currPlayer.steamId64);
    const extracted = jwt.verify(token, secret);

    expect(extracted["role"]).toBe(Role.authPlayer);
    expect(extracted["authPlayerRoles"].length).toBeGreaterThanOrEqual(0);
    
  });

  it('test player auth with ban right', async () => {
    
    const currPlayer = randomRegisteredPlayer({ban: true});

    jest.spyOn(regPlayerService, "getRegisteredPlayer").mockImplementation(async (options: IRegisteredPlayerIdentifier) => currPlayer);

    const token = await service.generateAuthPlayerToken(currPlayer.steamId64);
    const extracted = jwt.decode(token);
    expect(extracted["role"]).toBe(Role.authPlayer);
    expect(extracted["authPlayerRoles"]).toContain(AuthPlayerRole.ban);
    
  });

  it('test player auth with rootAdmin right', async () => {
    
    const currPlayer = randomRegisteredPlayer({rootAdmin: true});

    jest.spyOn(regPlayerService, "getRegisteredPlayer").mockImplementation(async (options: IRegisteredPlayerIdentifier) => currPlayer);

    const token = await service.generateAuthPlayerToken(currPlayer.steamId64);
    const extracted = jwt.decode(token);
    expect(extracted["role"]).toBe(Role.authPlayer);
    expect(extracted["authPlayerRoles"]).toContain(AuthPlayerRole.rootAdmin);
    
  });

  it('test unsuccessful login ', async () => {
    const currPlayer = randomRegisteredPlayer();
    jest.spyOn(regPlayerService, "getRegisteredPlayer").mockImplementation(async (options: IRegisteredPlayerIdentifier) => undefined);
    await expect(service.generateAuthPlayerToken(currPlayer.steamId64)).rejects.toThrow();
  });
  
});
