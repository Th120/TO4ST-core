import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import _ from "lodash"
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, Brackets, } from 'typeorm';
import memoizee from 'memoizee';
import { customAlphabet } from 'nanoid/async';
import moment from 'moment';


import { Gameserver } from './gameserver.entity';
import { Ban } from './ban.entity';
import {  MIN_SEARCH_LEN, MAX_PAGE_SIZE_WITH_STEAMID, TTL_CACHE_MS, CACHE_PREFETCH, PASSWORD_ALPHABET, DEFAULT_ID_LENGTH } from '../globals';
import { createGraphqlClientTo4stCore} from "../libs/client/graphql-client-to4st-core"
import { steamId64ToAccountId, mapDateForQuery, isValidSteamId } from '../shared/utils';
import { SteamUserService } from '../core/steam-user.service';
import { AppConfigService } from '../core/app-config.service';


/**
 * Inteface used for a ban check
 */
export interface IBanCheck {   
    /**
     * SteamId64 of banned player
     */
    steamId64?: string,

    /**
     * Id1 of player
     */
    id1?: string,

    /**
     * Id2 of player
     */
    id2?: string,

    /**
     * Ban id
     */
    id?: string,

    /**
     * Should query banlist partners of backend
     */
    queryBanlistPartners?: boolean
}

/**
 * Interface used for ban query
 */
export interface IBanQuery {   
    /**
     * SteamId64 of banned player
     */
    steamId64?: string,

    /**
     * SteamId64 of player who issued ban
     */
    bannedById64?: string,

    /**
     * Id1 of player
     */
    id1?: string,

    /**
     * Id2 of player
     */
    id2?: string,

    /**
     * Order descending by createdAt
     */
    orderDesc?: boolean,

    /**
     * Should be ordered by expiration date
     */
    orderByExpirationDate?: boolean, 

    /**
     * Don't include expired bans
     */
    noExpiredBans?: boolean,

    /**
     * Desired page
     */
    page?: number,

    /**
     * Desired page size
     */
    pageSize?: number,

    /**
     * Searches for steamId64, banned by steamId64, id1, id2, reason or gameserverId
     */
    search?: string
}

/**
 * Time limit a different backend has to answer the ban query
 */
const TIMEOUT_BANCHECK_PARTNER = 1000 * 4;

/**
 * Service for ban management
 */
@Injectable()
export class BanService {
    constructor(
        @InjectRepository(Ban) private readonly banRepository: Repository<Ban>, 
        @InjectConnection() private readonly connection: Connection,
        private readonly steamUserService: SteamUserService,
        private readonly appConfigService: AppConfigService
        )
    {
    }

    /**
     * Memoized number of active bans
     */
    private _cachedNumberOfActiveBans = memoizee(async () => (await this.getBans({pageSize: 1, noExpiredBans: true}))[1], {promise: true, maxAge: TTL_CACHE_MS, preFetch: CACHE_PREFETCH });

    /**
     * Query a different backend for a ban
     */
    /* istanbul ignore next */
    private queryBanlistPartnerForBan: (url: string, steamId64: string, id1?: string, id2?: string) => Promise<Ban | null> = async (url: string, steamId64: string, id1?: string, id2?: string) => 
    {
        const client = createGraphqlClientTo4stCore(url, TIMEOUT_BANCHECK_PARTNER);

        try
        {
            const ban = await client.client.chain.query.banCheck({banCheck: {steamId64: steamId64, id1: id1, id2: id2}})
            .execute({id: true, steamId64: true, expiredAt: true, reason: true, createdAt: true, gameserver: {id: true, currentName: true}});

            if(ban?.id)
            {
                return new Ban(
                    {
                        id: ban.id, 
                        steamId64: ban.steamId64, 
                        createdAt: moment.utc(ban.createdAt).toDate(),
                        expiredAt: moment.utc(ban.expiredAt).toDate(), 
                        reason: ban.reason, 
                        gameserver: new Gameserver({id: ban.gameserver.id, currentName: ban.gameserver.currentName})
                    });
            }
        }
        catch(e)
        {
            Logger.error(e);
        }
        
       return null;                    
    }

    /**
     * Override ban check of other backend for testing
     * @param override 
     */
    setOverrideBanlistPartnerRequest(override: (url: string, steamId64: string, id1?: string, id2?: string) => Promise<Ban | null>): void
    {
        this.queryBanlistPartnerForBan = override;
    }

    /**
     * Request player ban from banlist partners
     * @param steamId64 
     * @param id1 
     * @param id2 
     * @returns ban with longest remaining time
     */
    private async requestBanFromBanlistPartners(steamId64?: string, id1?: string, id2?: string,): Promise<Ban | null> 
    {
        try
        {
            const appcfg = await this.appConfigService.getAppConfig(true);
            const banlistPartners = appcfg.banlistPartners;

            const promises = banlistPartners.map(async x => await this.queryBanlistPartnerForBan(x, steamId64, id1, id2));
            const results = await Promise.all(promises);

            const onlyValid = results.filter(x => !!x);

            if(onlyValid.length > 0)
            {
                const sortedByLength = onlyValid.sort((x,y) => y.expiredAt.valueOf() - x.expiredAt.valueOf());
                return sortedByLength[0];
            }

        }
        catch(e)
        {
            Logger.error(e, "", "RequestBanFromBanlistPartners");
        }

       return null;
    }

    /**
     * Create or update ban
     * @param ban 
     * @returns inserted ban
     * @throws if banned self, any steamId not valid, expiration date not set, steamId not set
     */
    async createUpdateBan(ban: Ban): Promise<Ban>
    {
        ban = new Ban({...ban});

        if(ban.bannedById64 && ban.steamId64 === ban.bannedById64)
        {
            throw new HttpException(`Cannot ban self, AccountId: ${ban.steamId64}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(ban.steamId64)
        {
            if(!isValidSteamId(ban.steamId64))    
            {
                throw new HttpException(`Invalid SteamId64: ${ban.steamId64}`, HttpStatus.BAD_REQUEST);
            }        
        }

        if(ban.bannedById64 && ban.bannedById64.trim() !== "0")
        {
            if(!isValidSteamId(ban.bannedById64))    
            {
                throw new HttpException(`Invalid bannedBySteamId64: ${ban.bannedById64}`, HttpStatus.BAD_REQUEST);
            }        
        }

        if(ban.id)
        {
            ban.id1 = undefined;            //never update those values
            ban.id2 = undefined; 
            ban.steamId64 = undefined;
            ban.gameserver = undefined;
            ban.createdAt = undefined;
            ban.bannedById64 = undefined;
        }
        else
        {          
            ban.id = await customAlphabet(PASSWORD_ALPHABET, DEFAULT_ID_LENGTH)();

            if(!ban.bannedById64)
            {
                ban.bannedById64 = "0";
            }
            if(!ban.createdAt)
            {
                ban.createdAt = moment.utc().toDate();
            }
            if(!ban.gameserver?.id)
            {
                ban.gameserver = null;
            }
            if(!ban.expiredAt) 
            {
                throw new HttpException(`Expiration date not set`, HttpStatus.INTERNAL_SERVER_ERROR);
            }      
            if(!ban.steamId64) 
            {
                throw new HttpException(`steamId64 not set`, HttpStatus.INTERNAL_SERVER_ERROR);
            }       
           

            await this.steamUserService.updateSteamUsers([ban.steamId64, ban.bannedById64]);    
        }

        const inserted = await this.banRepository.save(ban);

        return await this.getBan({id: inserted.id});
    }

    /**
     * Get a ban
     * @param params 
     */
     async getBan(params: IBanCheck): Promise<Ban | null>
    {
        if(params.id)
        {
            const found = await this.banRepository.findOne({ where: {id: params.id }, relations: ["gameserver"] });
            return found ? found : null;
        }
        
        const [foundBans,] = await this.getBans({   
            steamId64: params.steamId64,
            id1: params.id1,
            id2: params.id2,
            orderDesc: true,
            orderByExpirationDate: true, 
            noExpiredBans: true,
            pageSize: 1,
        });

        if(foundBans.length > 0)
        {
            return foundBans[0];
        }

        if(params.queryBanlistPartners && (params.steamId64?.trim() || params.id1?.trim() || params.id2?.trim()))
        {
            const fromPartners = await this.requestBanFromBanlistPartners(params.steamId64, params.id1, params.id2);
            return fromPartners;
        }

        return null;
    }

    /**
     * Get number of active bans on backend
     */
    async getNumberOfActiveBansCached(): Promise<number>
    {
        return await this._cachedNumberOfActiveBans();
    }

    /**
     * Get bans
     * @param params
     * @returns Array of bans, total count, page count 
     */
    async getBans(params: IBanQuery): Promise<[Ban[], number, number]>
    {
        params.search = params.search?.trim().toLowerCase();
        params.page = Math.max(1, params.page ?? 1);
        params.pageSize = _.clamp(params.pageSize ?? MAX_PAGE_SIZE_WITH_STEAMID, 1, MAX_PAGE_SIZE_WITH_STEAMID)

        let queryBuilder = this.connection.createQueryBuilder().select("ban").from(Ban, "ban");

        queryBuilder = queryBuilder.leftJoinAndSelect("ban.gameserver", "gameserver");

        queryBuilder = queryBuilder.where("1=1"); //hack! allows chaining optional params

        if(params.steamId64?.trim())
        {           
            queryBuilder = queryBuilder.andWhere("ban.steamId64 = :steamId", { steamId: steamId64ToAccountId(params.steamId64) });
        }
      
        if(params.bannedById64?.trim())
        {
            queryBuilder = queryBuilder.andWhere("ban.bannedById64 = :steamIdBanned", { steamIdBanned: steamId64ToAccountId(params.bannedById64) });
        }
        
        if(params.id1?.trim())
        {
            queryBuilder = queryBuilder.andWhere("ban.id1 = :id1", { id1: params.id1 });
        }

        if(params.id2?.trim())
        {
            queryBuilder = queryBuilder.andWhere("ban.id2 = :id2", { id2: params.id2 });
        }

        if(params.noExpiredBans)
        {
            queryBuilder = queryBuilder.andWhere("ban.expiredAt > :ex", {ex: mapDateForQuery(moment.utc().toDate())});
        }

        if(params.search && params.search.length >= MIN_SEARCH_LEN)
        {
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {

                const steamId = steamId64ToAccountId(params.search);

                if(!params.steamId64 && steamId > -1)
                {
                    qb = qb.orWhere("ban.steamId64 = :steamIdS", { steamIdS: steamId });
                }

                if(!params.bannedById64 && steamId > -1)
                {
                    qb = qb.orWhere("ban.bannedById64 = :steamIdBanned", { steamIdBanned: steamId });
                }

                qb.orWhere("LOWER(ban.id) like :search", {search: `%${params.search}%`})
                .orWhere("LOWER(id1) like :search", {search: `%${params.search}%`})
                .orWhere("LOWER(id2) like :search", {search: `%${params.search}%`})
                .orWhere("LOWER(ban.reason) like :search", {search: `%${params.search}%`})
                .orWhere("LOWER(gameserver.id) like :search", {search: `%${params.search}%`})

            }));
        }

        queryBuilder = queryBuilder.skip(params.pageSize * (params.page - 1)).take(params.pageSize);

        queryBuilder = queryBuilder.orderBy(params.orderByExpirationDate ? "ban.expiredAt" : "ban.createdAt", params.orderDesc ? "DESC" : "ASC");

        const ret = await queryBuilder.getManyAndCount();

    
        return [ret[0], ret[1], Math.ceil(ret[1] / params.pageSize)];
    }

    /**
     * Delete ban
     * @param id 
     */
    async deleteBan(id: string): Promise<void>
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(Ban)
        .where("id = :id", { id: id })
        .execute();
    }

}
