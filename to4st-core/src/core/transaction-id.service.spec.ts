import { Test, TestingModule } from '@nestjs/testing';
import { chance } from 'jest-chance';
import { genTypeORMTestCFG, randomSteamId64s, N, forN } from '../testUtils';
import { STEAM_API_KEY } from "../globals"
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionIdService } from './transaction-id.service';
import { TransactionId } from './transaction-id.entity';
import { TIMEOUT_PROMISE_FACTORY } from '../shared/utils';

describe('TransactionIdService', () => {
  let service: TransactionIdService;
  let module: TestingModule;
  beforeEach(async () => {
      module = await Test.createTestingModule({
      imports: [
        genTypeORMTestCFG([TransactionId]), 
        TypeOrmModule.forFeature([TransactionId]),
      ],
      providers: [TransactionIdService, ],
    }).compile();

    service = module.get<TransactionIdService>(TransactionIdService);
   
  });

  const resultsToTest = [true, {hello: "jo", other: 1.5}, 16, ];

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set', async () => {
    expect((await service.requestTransaction(chance.guid({version: 4})))[0]).toBeTruthy();
  });

  it('should set N', async () => {
    
    await forN(async (idx) => {
      expect((await service.requestTransaction(chance.guid({version: 4})))[0]).toBeTruthy();
    })
    
  });

  it('should set result', async () => {
    const id = chance.guid({version: 4});
    await service.requestTransaction(id);
    const saved = chance.integer();
    await service.setResultTransaction(id, saved);

    const [success, res] = await service.requestTransaction(id);

    expect(success).toBeFalsy();
    expect(res).toBe(saved)
  });

  it('should set after purge', async () => {
    
    const id = chance.guid({version: 4});
    expect((await service.requestTransaction(id))[0]).toBeTruthy();
    expect((await service.requestTransaction(id))[0]).toBeFalsy();

    await TIMEOUT_PROMISE_FACTORY(5000)[0];

    await service.purgeTransactionIds(new Date());

    expect((await service.requestTransaction(id))[0]).toBeTruthy();
    
  });

  it('should set after remove', async () => {
    
    const id = chance.guid({version: 4});
    expect((await service.requestTransaction(id))[0]).toBeTruthy();
    expect((await service.requestTransaction(id))[0]).toBeFalsy();
    await service.removeTransactionId(id);

    expect((await service.requestTransaction(id))[0]).toBeTruthy();
    
  });

  afterEach( async () => {
    await module.close();
  });

});
