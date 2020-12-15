import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_AVATAR_FULL, DEFAULT_AVATAR_MEDIUM, SteamUserService } from './steam-user.service';
import { chance } from 'jest-chance';
import { AppConfigService } from './app-config.service';
import { genTypeORMTestCFG, randomSteamId64s, N} from '../testUtils';
import {STEAM_API_KEY } from '../globals';
import { AuthKey } from './auth-key.entity';
import { AppConfig } from './app-config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import testConfiguration from '../testConfiguration';
import { SteamUser } from './steam-user.entity';
import { isValidSteamId, steamId64ToAccountId } from '../shared/utils';
import * as realChance from "chance"

interface SimpleUser {
  steamId64: string,
  name?: string,
  whatever: string
}

const querySteamUserMock = async (chunkedSteamIds: string[]) => 
{
    await new Promise(resolve => setTimeout(resolve, 2400)); // simulate slow steamworks request

    const avatarBig = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/45/450ce98031788c110214741eb1e0b3d3044b47e3_full.jpg";
    const avatarMed = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/45/450ce98031788c110214741eb1e0b3d3044b47e3_medium.jpg";

    const mappedData = chunkedSteamIds.map(x => {

        const accountId = steamId64ToAccountId(x);
        
        const nameGenerator = realChance.Chance(accountId);

        return new SteamUser({steamId64: x, name: nameGenerator.word(), avatarBigUrl: avatarBig, avatarMediumUrl: avatarMed});
    });

    return mappedData;
};

describe('SteamUserService', () => {
  let service: SteamUserService;
  let cfgService: AppConfigService;
  let module: TestingModule;
  beforeEach(async () => {
      module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true, load: [testConfiguration],}),
        genTypeORMTestCFG([AuthKey, AppConfig, SteamUser]), 
        TypeOrmModule.forFeature([AuthKey, AppConfig, SteamUser]),
      ],
      providers: [SteamUserService, AppConfigService],
    }).compile();

    service = module.get<SteamUserService>(SteamUserService);
    cfgService = module.get<AppConfigService>(AppConfigService);

    process.env.ALLOW_LAZY_UPDATE_STEAMUSERS = "TRUE";

    jest.spyOn(cfgService, "getAppConfig").mockImplementation(async (cached: boolean) =>  new AppConfig({steamWebApiKey: STEAM_API_KEY}));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach( async () => {
    await module.close();
    process.env.ALLOW_LAZY_UPDATE_STEAMUSERS = "";
  });

  it('test real names', async () => {
    const incomplete: SimpleUser[] = [{steamId64: "76561198032109755", whatever: chance.sentence()}, {steamId64: "76561198393183882", whatever: chance.sentence()}, {steamId64: "76561197982580194", whatever: chance.sentence()}];
    
    const incompleteMapped = incomplete.map(x => x.steamId64);

    await service.updateSteamUsers(incompleteMapped, false);

    const result = await service.getSteamUsers(incompleteMapped);

    expect(result.length).toBe(incomplete.length);

    result.forEach(x => {
      expect(incompleteMapped).toContain(x.steamId64);
      expect(x.avatarBigUrl).toBeDefined();
      expect(x.avatarMediumUrl).toBeDefined();
      expect(x.name).toBeDefined();
      expect(x.lastUpdate).toBeDefined();
    });
    
    expect(result.some(x => x.name === "Th120")).toBeTruthy();

  });

  it('test update non cached', async () => {
    service.setSteamRequestOverride(querySteamUserMock);

    const steamIds = randomSteamId64s({count: N, seed: chance.integer()});
    const expectedUserData = await querySteamUserMock(steamIds);

    await service.updateSteamUsers(steamIds, false);

    const result = await service.getSteamUsers(steamIds, false);

    expectedUserData.forEach(x => {
      const found = result.find(y => y.steamId64 === x.steamId64);
      expect(found).toMatchObject(x);
      expect(found.lastUpdate).toBeDefined();
    });

  });

  it('test update twice', async () => {
    service.setSteamRequestOverride(querySteamUserMock);

    const steamIds = randomSteamId64s({count: N, seed: chance.integer()});
    const expectedUserData = await querySteamUserMock(steamIds);

    await service.updateSteamUsers(steamIds, false);

    // just make sure another insert / update happened
    // MIGHT TRIGGER ERROR LOG BECAUSE TEST FINISHES BEFORE PROMISE IS RESOLVED!
    await service.updateSteamUsers(steamIds, true); 

    const result = await service.getSteamUsers(steamIds, false);

    expectedUserData.forEach(x => {
      const found = result.find(y => y.steamId64 === x.steamId64);
      expect(found).toMatchObject(x);
      expect(found.lastUpdate).toBeDefined();
    });

    await new Promise(resolve => setTimeout(resolve, 6000)); // wait for promise resolve

  });

  it('test update cached', async () => {
    service.setSteamRequestOverride(querySteamUserMock);

    const steamIds = randomSteamId64s({count: N, seed: chance.integer()});
    const expectedUserData = await querySteamUserMock(steamIds);

    await service.updateSteamUsers(steamIds, false);

    const result = await service.getSteamUsers(steamIds, true);

    expectedUserData.forEach(x => {
      const found = result.find(y => y.steamId64 === x.steamId64);
      expect(found).toMatchObject(x);
      expect(found.lastUpdate).toBeDefined();
    });

  });


  it('test update lazy', async () => {
    service.setSteamRequestOverride(querySteamUserMock);

    const steamIds = randomSteamId64s({count: N, seed: chance.integer()});
    const expectedUserData = await querySteamUserMock(steamIds);

    await service.updateSteamUsers(steamIds, true);

    const resultNotFilled = await service.getSteamUsers(steamIds, true);

    resultNotFilled.forEach(x => {
      expect(steamIds).toContain(x.steamId64);
      expect(x.avatarBigUrl).toBe(DEFAULT_AVATAR_FULL);
      expect(x.avatarMediumUrl).toBe(DEFAULT_AVATAR_MEDIUM);
      expect(x.name).toBe(x.steamId64);
      expect(x.lastUpdate).toBeNull();
    });

    await new Promise(resolve => setTimeout(resolve, 6000)); // lazy update should be finished

    const result = await service.getSteamUsers(steamIds, true);

    expectedUserData.forEach(x => {
      const found = result.find(y => y.steamId64 === x.steamId64);
      expect(found).toMatchObject(x);
      expect(found.lastUpdate).toBeDefined();
    });

  });
});
