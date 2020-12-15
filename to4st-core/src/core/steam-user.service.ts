import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,  LessThan, IsNull, ILike } from 'typeorm';
import _ from "lodash"
import LRUCache from "lru-cache"


import { SteamUser } from './steam-user.entity';
import { isValidSteamId, TIMEOUT_PROMISE_FACTORY, } from '../shared/utils';
import { AppConfigService } from './app-config.service';
import moment from 'moment';


/**
 * Duration steam user info stays in cache before updated
 */
const TTL_STEAMUSER_CACHE = 60 * 60 * 1000;

/**
 * Delay between updating outdated steam user info in database
 */
const LAZY_UPDATE_OUTDATED_INTERVAL = 15 * 60 * 1000;

/**
 * Default cachesize
 */
const CACHESIZE = 7777;

/**
 * Max age before user info must be updated
 */
const MAX_AGE_STEAMUSER_DB = 2 * 60 * 60 * 1000;

/**
 * Count of steam user info entries updated at once
 */
const MAX_STEAMUSERS_UPDATED_AT_ONCE = 300;


/**
 * Service used to store steam user data 
 */
@Injectable()
export class SteamUserService implements OnApplicationBootstrap
{
    constructor(private readonly appConfigService: AppConfigService, @InjectRepository(SteamUser) private readonly steamUserRepo: Repository<SteamUser>, )
    {
        
    }

    /**
     * Cache used to speed up service for field resolvers
     */
    private static steamUserCache = new LRUCache<string, SteamUser>({max: CACHESIZE, maxAge: TTL_STEAMUSER_CACHE, noDisposeOnSet: true, stale: true});

    /**
     * Interval used for lazy update of steam user data from database
     */
    private static updateInterval: NodeJS.Timeout = null;

    /**
     * Used to prevent service being initialized more than once
     */
    private static initialized = false;

    /**
     * List of outdated steamId that need to be refreshed in the cache
     */
    private outdatedSteamIds: string[] = [];
    
    /* istanbul ignore next */
    public async onApplicationBootstrap()
    {
        if(process.env.NODE_ENV !== "test") // makes no sense during tests
        {
            if(!SteamUserService.updateInterval && !SteamUserService.initialized)
            {
                this.initSteamUserUpdater();
            }
        }
    }

    /**
     * Get client used for requesting steamIds
     */
    private getAxios(): AxiosInstance
    {
        return axios.create({
            baseURL: 'https://api.steampowered.com/',
            timeout: 12000
          });
    }


    /**
     * Query Steam API for chunk of SteamIds
     * @param chunkedSteamIds Max array size, limited by Steam API
     */
    private querySteamIds: (chunkedSteamIds: string[]) => Promise<SteamUser[]> = async (chunkedSteamIds: string[]) =>
    {
        const result: SteamUser[] = [];

        const appCfg = await this.appConfigService.getAppConfig(true);
        if(!appCfg?.steamWebApiKey)
        {
            return result; 
        }

        try 
        {
            if(chunkedSteamIds.length > 0)
            {
                const csl = chunkedSteamIds.join(",");

                const res = await this.getAxios().get("/ISteamUser/GetPlayerSummaries/v2/", {params: {key: appCfg.steamWebApiKey, steamids: csl}});
                
                const resultArray = res?.data?.response?.players as any[];

                resultArray.forEach(x => result.push(new SteamUser(
                    {
                        steamId64: x.steamid,
                        name: x.personaname,
                        avatarBigUrl: x.avatarfull,
                        avatarMediumUrl: x.avatarmedium,
                    }
                    ))); 
            }
        }
        catch(e)
        {
            Logger.error(e);
        }

        return result;
    }

    /**
     * Set override for testing
     * @param override 
     */
    setSteamRequestOverride(override: (chunkedSteamId: string[]) => Promise<SteamUser[]>): void
    {
        this.querySteamIds = override;
    }

    /**
     * Update steam user data in database
     * @param players Array of steamId64
     * @param lazy Steam request should be handled lazily (causes quite high delay)
     */
    async updateSteamUsers(players: string[], lazy = true): Promise<void>
    {
        if(players.length === 0)
        {
            return;
        }

        const filtered = players.filter(x => isValidSteamId(x));
        const unique = _.uniq(filtered);

        const chunked = _.chunk(unique.map(x => new SteamUser({steamId64: x})), 200);

        await Promise.all(chunked.map(x => this.steamUserRepo.save(x)));

        const remapped = unique.map(x => new SteamUser({steamId64: x})); // for some reason Typeorm sets steamId to '0' after inserting

        if(lazy)
        {
            if(process.env.NODE_ENV !== "test" || process.env.ALLOW_LAZY_UPDATE_STEAMUSERS) //never do implicit lazy updates during testing
            {
                this.updateUserData(remapped, true).catch(e => Logger.error(`Lazy update steam users failed${e ? `:\n ${e}` : ""}`));
            }
        }
        else
        {
            await this.updateUserData(remapped, true);
        }
    }

    /**
     * Initializes lazy updater for steam user data in database
     */
    /* istanbul ignore next */
    public initSteamUserUpdater(): void
    {
        if(SteamUserService.initialized)
        {
            Logger.error("SteamUser updater can't be init more than once.")
            return;
        }

        SteamUserService.initialized = true;

        this.updateSteamUsersInDatabase();
    }

    /**
     * Sets up infinite steam user data update cycle
     * Starts next interval after query is finished 
     * Restarts almost instantly if there are still some outdated users in database
     */
    /* istanbul ignore next */
    private async updateSteamUsersInDatabase()
    {
        let shouldUpdateAgain = false;
        try
        {
            const foundOutdated = await this.getOutdatedSteamUsers();
            await this.updateUserData(foundOutdated, false);

            const remainingOutdated = await this.getOutdatedSteamUsers();
            shouldUpdateAgain = remainingOutdated.length > 0;
        }
        catch (e)
        {
            Logger.error(e);
        }

        SteamUserService.updateInterval = setTimeout(async () => {
            this.updateSteamUsersInDatabase();
        }, shouldUpdateAgain ? 1000 * 10 : LAZY_UPDATE_OUTDATED_INTERVAL);
    }

    /**
     * Search steam ids by name
     * @param names Array of names
     */
    async getSteamUsersByName(name: string): Promise<SteamUser[]>
    {
        const find = await this.steamUserRepo.find({where: {name: ILike(`%${name}%`)}});
        return find;
    }

    /**
     * Find steam user info which should be updated
     * @returns List of outdated steamId users
     */
    private async getOutdatedSteamUsers()
    {
        return await this.steamUserRepo.find({
            where: [
                { lastUpdate: LessThan(moment.utc().subtract(MAX_AGE_STEAMUSER_DB, "milliseconds").toDate())},
                { lastUpdate: IsNull() },
            ],
            take: MAX_STEAMUSERS_UPDATED_AT_ONCE
        });
    }

    /**
     * Start a delayed update of stale steamIds from the cache
     * @param staleSteamIds 
     */
    private lazyUpdateStale(staleSteamIds: string[]): void
    {        
        this.outdatedSteamIds = [...this.outdatedSteamIds, ...staleSteamIds];
        
        // Add small delay to avoid making a request for just one steam user that was requested by a field resolver
        if(staleSteamIds.length === this.outdatedSteamIds.length)
        {
            const lazy = async () =>  {
                await TIMEOUT_PROMISE_FACTORY(2000)[0];

                const toUpdate = [...this.outdatedSteamIds];
                this.outdatedSteamIds = []; // steam ids could be added while database request is running

                const found = await this.steamUserRepo.find( { where: toUpdate.map(x => ({steamId64: x})) } );
                found.forEach(x => SteamUserService.steamUserCache.set(x.steamId64, x));
            };

            lazy().catch(e => Logger.warn(`Lazy update stale failed ${e}`));
        }
    }

    /**
     * Retrieve steam user data for steamIds
     * @param steamIds Array of steamId64
     * @param cached Should prioritize data from cache if existing
     */
    async getSteamUsers(steamIds: string[], cached = true): Promise<SteamUser[]>
    {
        const mapped = steamIds.map(x => ({steamId64: x}));
    
        if(cached)
        {
            const foundCached = mapped.map(x => SteamUserService.steamUserCache.get(x.steamId64)).filter(x => !!x);
            const wasStale = foundCached.filter(x => !SteamUserService.steamUserCache.has(x.steamId64));
    
            if(wasStale.length > 0)
            {
                //Insert into cache again, but run lazy cache update
                wasStale.forEach(x => SteamUserService.steamUserCache.set(x.steamId64, x));
                this.lazyUpdateStale(wasStale.map(x => x.steamId64));
            }
        }
        
        const filteredByCache = cached ? mapped.filter(x => !SteamUserService.steamUserCache.has(x.steamId64)) : mapped;
        if(filteredByCache.length > 0)
        {
            const found = await this.steamUserRepo.find({where: filteredByCache});
            found.forEach(x => SteamUserService.steamUserCache.set(x.steamId64, x));
        }
        
        return steamIds.map(x => SteamUserService.steamUserCache.get(x)).filter(x => !!x);
    }

    /**
     * Updates steam user data in database
     * @param players Array if steam user data
     * @param cacheResults Should put results into cache
     */
    private async updateUserData(players: SteamUser[], cacheResults = true): Promise<void>
    {
        const chunks = _.chunk(players, 100); // Steam web api does not allow more than 100 player summary requests, sending multiple requests. 

        const steamUsers = await Promise.all(chunks.map(x => this.querySteamIds(x.map(y => y.steamId64))));

        const flatUsers = steamUsers.flat() as SteamUser[];

        const mappedPlayers = players.map(x => {
            const foundSteamUser = flatUsers.find(y => y.steamId64 === x.steamId64);
            const now = moment.utc().toDate();

            if(foundSteamUser)
            {
                return new SteamUser(
                    {
                        steamId64: foundSteamUser.steamId64, 
                        name: foundSteamUser.name, 
                        avatarBigUrl: foundSteamUser.avatarBigUrl, 
                        avatarMediumUrl: foundSteamUser.avatarMediumUrl,
                        lastUpdate: now
                    });
            }

            return new SteamUser({steamId64: x.steamId64, lastUpdate: now}); //did not get user data from steam, insert anyway and mark as up2date
        });

        if(cacheResults)
        {
            mappedPlayers.forEach(x => SteamUserService.steamUserCache.set(x.steamId64, x));
        }

        const insertPromises = _.chunk(mappedPlayers, 200).map(x => this.steamUserRepo.save(x));

        await Promise.all(insertPromises);
        
    }

    

  
}
