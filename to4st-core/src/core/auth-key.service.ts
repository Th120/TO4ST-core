import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, Like } from 'typeorm';
import {nanoid} from 'nanoid/async';
import _ from 'lodash'


import { AuthKey } from './auth-key.entity';
import { MIN_AUTH_KEY_LENGTH, MIN_SEARCH_LEN, MAX_PAGE_SIZE } from '../globals';


/**
 * Interface used to identify authKeys.
 * Either one of the variables is used to identify an authKey
 */
export interface IAuthKeyIdentifier
{
    /**
     * Id of an authKey
     */
    id?: number, 

    /**
     * AuthKey string itself
     */
    authKey?: string
}

/**
 * Interface used to query authKeys
 */
export interface IAuthKeyQuery
{
    /**
     * Desired page
     */
    page?: number, 
    /**
     * Desired page size
     */
    pageSize?: number, 
    /**
     * Orders by lastUse of authKey
     */
    orderDesc?: boolean, 
    /**
     * Search for partial of description or authKey string
     */
    search?: string
}


/**
 * Service used to manage authKeys
 */
@Injectable()
export class AuthKeyService {
    constructor(@InjectConnection() private readonly connection: Connection, 
    @InjectRepository(AuthKey) private readonly authKeyRepository: Repository<AuthKey>,
    )
    {
    }

    /**
     * Create or update (updates if authKey object has an id) an authKey
     * @returns Current version of authKey from database
     * @param authKey 
     */
    async createUpdateAuthKey(authKey: AuthKey): Promise<AuthKey>
    {
        authKey = new AuthKey({...authKey});

        if(!authKey.id && authKey.authKey)
        {
            const existingAuthKey = await this.authKeyRepository.findOne({ authKey: authKey.authKey });
            authKey.id = existingAuthKey?.id;
        }

        if(authKey.authKey?.trim().length < MIN_AUTH_KEY_LENGTH)
        {
            throw new HttpException(`AuthKey (${authKey.authKey}, length: ${authKey.authKey.length} does not fulfill min length: ${MIN_AUTH_KEY_LENGTH})`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(!authKey.authKey)
        {
            authKey.authKey = await nanoid(MIN_AUTH_KEY_LENGTH);
        }    

        if(!authKey.lastUse)
        {
            authKey.lastUse = new Date();
        }

        const insert = await this.authKeyRepository.save(authKey);
        return await this.getAuthKey({id: insert.id});
    }


    /**
     * Delete an authKey
     * @param options 
     */
    async deleteAuthKey(options: IAuthKeyIdentifier): Promise<void>
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(AuthKey)
        .where(options.id ? "id = :id" : "authKey = :key", options.id ? { id: options.id } : { key: options.authKey } )
        .execute();
    }


    /**
     * Get an authKey
     * @param options 
     */
    async getAuthKey(options: IAuthKeyIdentifier): Promise<AuthKey | undefined>
    {
        const opt = options.authKey ? {authKey: options.authKey} : { id: options.id };
        return await this.authKeyRepository.findOne({where: opt});
    }

    /**
     * Query multiple authKeys
     * @param params 
     */
    async getAuthKeys(params: IAuthKeyQuery): Promise<[AuthKey[], number, number]>
    {
        params.page = Math.max(1, params.page ?? 1);
        params.pageSize = _.clamp(params.pageSize ?? MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE)
        params.search = params.search ?? "";
        params.orderDesc = params.orderDesc ?? true;
        const ret = await this.authKeyRepository.findAndCount({
            take: params.pageSize,
            skip: params.pageSize * (params.page - 1),
            where: params.search.length >= MIN_SEARCH_LEN? [{description: Like(`%${params.search}%`)}, {authKey: Like(`%${params.search}%`)}] : undefined,
            order: {
                lastUse: params.orderDesc ? "DESC" : "ASC"   
            } 
        });

        return [ret[0], ret[1], Math.ceil(ret[1] / params.pageSize)];
    }
}
