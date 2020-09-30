import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import _ from "lodash"
import { Repository, Connection, Like } from 'typeorm';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { nanoid, customAlphabet } from 'nanoid/async';


import { Gameserver } from './gameserver.entity';
import { MIN_AUTH_KEY_LENGTH, MIN_ID_LENGTH, PASSWORD_ALPHABET, MIN_SEARCH_LEN, MAX_PAGE_SIZE } from '../globals';

/**
 * Interface used to identify a gameserver
 */
export interface IGameserverIdentifier {
    /**
     * AuthKey of gameserver
     */
    authKey?: string, 

    /**
     * Id of gameserver
     */
    id?: string
}

/**
 * Interface used to query gameservers
 */
export interface IGameserverQuery {
    /**
     * Desired page
     */
    page?: number, 

    /**
     * Desired page size
     */
    pageSize?: number, 

    /**
     * Search description, authKey, current name
     */
    search?: string, 

    /**
     * Should order by current name?
     */
    orderByCurrentName?: boolean, 

    /**
     * Should order desc by last contact?
     */
    orderDesc?: boolean
}

/**
 * Service used to manage gameservers
 */
@Injectable()
export class GameserverService {
    constructor(
        @InjectRepository(Gameserver) private readonly gameserverRepository: Repository<Gameserver>, 
        @InjectConnection() private readonly connection: Connection,
        )
    {
    }

    /**
     * Get gameserver
     * @param options 
     */
    async getGameserver(options: IGameserverIdentifier): Promise<Gameserver | undefined>
    {
        const res = await this.gameserverRepository.findOne(!!options.id ? { id: options.id } : { authKey: options.authKey });
        return res;
    }

    /**
     * Get gameservers
     * @param options 
     * @returns Array of gameservers, total count, count pages
     */
    async getGameservers(options: IGameserverQuery): Promise<[Gameserver[], number, number]>
    {
        options.page = options.page ?? 1;
        options.pageSize = _.clamp(options.pageSize ?? MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE);
        options.search = options.search ?? "";
        options.orderByCurrentName = options.orderByCurrentName ?? false;
        options.orderDesc = options.orderDesc ?? true;

        const ret = await this.gameserverRepository.findAndCount({
            take: options.pageSize,
            skip: options.pageSize * (options.page - 1),
            where: options.search.length >= MIN_SEARCH_LEN ? [{description: Like(`%${options.search}%`)}, {authKey: Like(`%${options.search}%`)}, {currentName: Like(`%${options.search}%`)}] : undefined,
            order: options.orderByCurrentName ? {currentName: options.orderDesc ? "DESC" : "ASC"} : {lastContact: options.orderDesc ? "DESC" : "ASC"} 
        });

        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }

    /**
     * Delete gameserver
     * @param options 
     */
    async deleteGameserver(options: IGameserverIdentifier): Promise<void>
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(Gameserver)
        .where(!!options.id ? "id = :id" : "authKey = :key", !!options.id ? { id: options.id } : { key: options.authKey })
        .execute();
    }

    /**
     * Create or update gameserver
     * @param server 
     * @throws if authKey / id does not match min length
     */
    async createUpdateGameserver(server: Gameserver): Promise<Gameserver>
    {
        server = new Gameserver({...server});

        if(!server.id)
        {   
            server.lastContact = new Date();
            server.id = await customAlphabet(PASSWORD_ALPHABET, MIN_ID_LENGTH)();

            if(!server.authKey)
            {
                server.authKey = await nanoid(MIN_AUTH_KEY_LENGTH);
            }
        }

        if(server.authKey && server.authKey.trim().length < MIN_AUTH_KEY_LENGTH)
        {
            throw new HttpException(`Server AuthKey (${server.authKey}, length: ${server.authKey.length} does not fulfill min length: ${MIN_AUTH_KEY_LENGTH})`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(server.id.trim().length < MIN_ID_LENGTH)
        {
            throw new HttpException(`Server Id (${server.id}, length: ${server.id.length} does not fulfill min length: ${MIN_ID_LENGTH})`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const inserted = await this.gameserverRepository.save(server);

        return await this.getGameserver({id: inserted.id});
    }


}
