import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import _ from "lodash"
import { Repository, Connection, Like, Brackets } from 'typeorm';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { nanoid, customAlphabet } from 'nanoid/async';
import { registerEnumType } from '@nestjs/graphql';


import { Gameserver } from './gameserver.entity';
import { MIN_AUTH_KEY_LENGTH, MIN_ID_LENGTH, PASSWORD_ALPHABET, MIN_SEARCH_LEN, MAX_PAGE_SIZE } from '../globals';


/**
 * Enum used to filter gameservers 
 */
export enum GameserverConfigFilter {
    none = "none",
    withConfig = "withConfig",
    withoutConfig = "withoutConfig"
}

/**
 * Register enum type in graphQL
 */
registerEnumType(GameserverConfigFilter, {
    name: "GameserverConfigFilter",
});

/**
 * Enum used to sort gameservers 
 */
export enum GameserverConfigOrder {
    currentName = "currentName",
    lastContact = "lastContact",
    hasConfig = "hasConfig"
}

/**
 * Register enum type in graphQL
 */
registerEnumType(GameserverConfigOrder, {
    name: "GameserverConfigOrder",
});


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
    orderBy?: GameserverConfigOrder, 

    /**
     * Should order desc by last contact?
     */
    orderDesc?: boolean

    /**
     * Filter server with / without config
     */
    configFilter?: GameserverConfigFilter;
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
        if(res?.gameserverConfig?.currentName)
        {
            res.currentName = res.gameserverConfig.currentName;
        }
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
        options.orderBy = options.orderBy ?? GameserverConfigOrder.currentName;
        options.orderDesc = options.orderDesc ?? true;
        options.configFilter = options.configFilter ?? GameserverConfigFilter.none;        	

        let queryBuilder = this.connection.createQueryBuilder().select("gameserver").from(Gameserver, "gameserver");

        queryBuilder = queryBuilder.leftJoinAndSelect("gameserver.gameserverConfig", "gameserverConfig");
        queryBuilder = queryBuilder.leftJoinAndSelect("gameserverConfig.currentMatchConfig", "matchConfig");
        queryBuilder = queryBuilder.leftJoinAndSelect("matchConfig.gameMode", "gameMode");

        queryBuilder = queryBuilder.where("1=1"); 

        if(options.search)
        {
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
                qb.orWhere("gameserver.description like :search", {search: `%${options.search}%`})
                .orWhere("gameserver.authKey like :search", {search: `%${options.search}%`})
                .orWhere("gameserver.currentName like :search", {search: `%${options.search}%`})
                .orWhere("gameserver.id like :search", {search: `%${options.search}%`})
            }));
        }

        if(options.configFilter !== GameserverConfigFilter.none)
        {
            queryBuilder = queryBuilder.andWhere(`gameserver.gameserverConfig IS ${options.configFilter === GameserverConfigFilter.withConfig ? "NOT" : ""} NULL`)
        }

        queryBuilder = queryBuilder.skip(options.pageSize * (options.page - 1)).take(options.pageSize);

        let orderString = "currentName";

        switch (options.orderBy) {
            case GameserverConfigOrder.lastContact:
                orderString = "lastContact";
                break;
            case GameserverConfigOrder.hasConfig:
                orderString = "gameserverConfig";
                break;
        }

        queryBuilder = queryBuilder.orderBy("gameserver." + orderString, options.orderDesc ? "DESC" : "ASC");

        const ret = await queryBuilder.getManyAndCount();

        ret[0].forEach(x => {
            if(x?.gameserverConfig?.currentName)
            {
                x.currentName = x.gameserverConfig.currentName; 
            }

            if(x.gameserverConfig && !x.gameserverConfig.currentMatchConfig)
            {
                x.gameserverConfig = null; // getting rid of null case object (wtf)
            }
        })

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
