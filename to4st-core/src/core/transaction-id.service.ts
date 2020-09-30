import { Injectable, Logger, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import _ from "lodash"
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository,  Connection } from 'typeorm';
import iso8601 from "iso8601-validator"

import { mapDateForQuery, roundDate, } from '../shared/utils';
import { TransactionId } from './transaction-id.entity';


/**
 * Delay between purge of outdated transactionIds
 */
const PURGE_INTERVAL = 1000 * 60 * 60;

/**
 * Max age of a transactionId before it is purged from database
 */
const MAX_AGE_TRANSACTIONID = 1000 * 60 * 60;


/**
 * Service used to manage transactionIds
 */
@Injectable()
export class TransactionIdService implements OnApplicationBootstrap
{
    constructor(@InjectRepository(TransactionId) private readonly transactionIdRepo: Repository<TransactionId>,@InjectConnection() private readonly connection: Connection, )
    {

    }

    /**
     * Purge interval 
     */
    private static purgeInterval: NodeJS.Timeout = null;

    /**
     * Used to prevent service being initialized more than once
     */
    private static initialized = false;

    /**
     * Inits service on application start
     */
    /* istanbul ignore next */
    public async onApplicationBootstrap()
    {
        if(process.env.NODE_ENV !== "test" && !TransactionIdService.purgeInterval && !TransactionIdService.initialized)
        {
            await this.purgeTransactionIdsCycle();
        }
    }

    /**
     * Sets transactionId
     * @param id 
     * @returns [true if transaction was successful created, result of last operation using the id]
     */
    public async requestTransaction(id: string): Promise<[boolean, any]>
    {
        id = id.trim();
        
        try
        {
            await this.transactionIdRepo.insert(new TransactionId({transactionId: id, insertedAt: new Date()}));
            return [true, null]
        }
        catch(e)
        {

        }

        const found = await this.transactionIdRepo.findOne({select: ["transactionId", "resultJSON"], where: {transactionId: id}});

        if(!found)
        {
            throw new HttpException(`Did not find transaction <${id}>`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
 
        return [false, found.resultJSON ? JSON.parse(found.resultJSON, (key, value) => typeof value === "string" && iso8601.test(value) ? new Date(value) : value).res : null];
    }   

    /**
     * Saves result literal object of a transaction, role based filtering should be applied before
     * @param transactionId 
     * @param result 
     */
    public async setResultTransaction(transactionId: string, result: any): Promise<void>
    {
        const resultUpdate = result === null || result === undefined ? {} : {res: result};
        const updated = new TransactionId({transactionId: transactionId, resultJSON: JSON.stringify(resultUpdate)});
        await this.transactionIdRepo.save(updated);
    }

    /**
     * Sets up infinite purge cycle, starts next interval after current purge is finished
     */
    /* istanbul ignore next */
    private async purgeTransactionIdsCycle()
    {
        TransactionIdService.initialized = true;
        try 
        {
            await this.purgeTransactionIds(new Date(Date.now() - MAX_AGE_TRANSACTIONID));
        }
        catch (e)
        {
            Logger.error(e || "Error while purging transactionsIds", "", "TransactionId purge");
        }

        TransactionIdService.purgeInterval = setTimeout(async () => {
            this.purgeTransactionIdsCycle();
        }, PURGE_INTERVAL);
    }

    /**
     * Remove transactionId, freeing it
     * @param id 
     */
    async removeTransactionId(id: string)
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(TransactionId)
        .where("transactionId = :id", { id: id })
        .execute();
    }

    /**
     * Purges all transactionIds which were used before date
     * @param before 
     */
    async purgeTransactionIds(before: Date)
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(TransactionId)
        .where("insertedAt < :past", { past: mapDateForQuery(before) })
        .execute();
    }
}
