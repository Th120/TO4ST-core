import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, } from 'typeorm';
import { nanoid, customAlphabet } from 'nanoid/async';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import memoizee from "memoizee"
import _ from 'lodash'
import isURL from 'validator/lib/isURL';

import { MIN_PW_LENGTH, SECRET_LENGTH, PASSWORD_ALPHABET, BCRYPT_ROUNDS, MAX_PW_LENGTH, TTL_CACHE_MS, CACHE_PREFETCH, DEFAULT_PW_LENGTH } from '../globals';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app-config.entity';
import { hashPassword } from '../shared/utils';


/**
 * Service which manages the AppConfiguration
 */
@Injectable()
export class AppConfigService implements OnModuleInit {
    constructor(@InjectConnection() private readonly connection: Connection, 
    @InjectRepository(AppConfig) private readonly appConfigRepository: Repository<AppConfig>,
    private readonly configService: ConfigService)
    {
    }

    /**
     * Memoized configuration to speed up the website loading
     */
    private memoizedAppConfig = memoizee(this._getAppConfig, {promise: true, maxAge: TTL_CACHE_MS, preFetch: CACHE_PREFETCH });

    /* istanbul ignore next */
    async onModuleInit(): Promise<void> 
    {
        await this.initAppConfig();
    }

    /**
     * Get the configuration of this instance
     * @param cached Retrieve a memoized version to save time
     */
    async getAppConfig(cached = false): Promise<AppConfig>
    {
        if(cached)
        {
            const found = await this.memoizedAppConfig()
            if(found)
            {
                return found;
            }
        }

        return await this._getAppConfig();
    }

    /**
     * Get the configuration of this instance
     */
    private async _getAppConfig(): Promise<AppConfig | undefined>
    {
        const found = await this.appConfigRepository.findOne({where: { instanceId: this.configService.get<string>("instanceId")}});
        return found;
    }

    /**
     * Initialize appConfiguration if it does not exist for the current instanceId.
     * Takes care of assigning initial password or overrides password while running e2e tests or using reset password environment variable
     * 
     */
    async initAppConfig(): Promise<void>
    {
        const instanceId = this.configService.get<string>("instanceId");
        Logger.log(`Loading appConfig for instanceId <${instanceId}>`, "AppConfig");
        
        try
        {
            await this.connection.transaction("SERIALIZABLE", async manager => 
            {
                const foundConfig = await manager.findOne(AppConfig, {
                    where: { instanceId: instanceId }
                });
    
                if(!foundConfig)
                {
                    Logger.warn(`Could not find appConfig for instanceId <${instanceId}>, initialising new config...`, "AppConfig");
                    
                    if(this.configService.get<string>("password").length > 0)
                    {
                        var password = await this.configService.get<string>("password");
                    }
                    else {
                        var password = await customAlphabet(PASSWORD_ALPHABET, DEFAULT_PW_LENGTH)();
                    }
                    const hashed =  hashPassword(password) //double hash because password is expected to be pre hashed on the client

                    const hash = await bcrypt.hash(hashed, BCRYPT_ROUNDS);
                    const secret = await nanoid(SECRET_LENGTH);
                    const config = new AppConfig({instanceId: instanceId, password: hash, secret: secret});
    
                    await manager.save(config);

                    Logger.warn(`AppConfig initialised. Default admin panel password for this session <${password}>. Please set a proper password in the admin panel`, "AppConfig");
                    Logger.warn(`Keep in mind only the most recent logged password of an instance is valid`, "AppConfig");
                }
                /* istanbul ignore if  */ // won't be executed in tests with in-memory db
                else if(this.configService.get<boolean>("forceResetPassword"))
                {
                 
                    Logger.warn(`Reinitialising password for instanceId <${instanceId}>...`, "AppConfig");
                    foundConfig.passwordInitialised = false;
                    if(this.configService.get<string>("password").length > 0)
                    {
                        var password = await this.configService.get<string>("password");
                        foundConfig.passwordInitialised = true;
                    }
                    else {
                        var password = await customAlphabet(PASSWORD_ALPHABET, DEFAULT_PW_LENGTH)();
                    }
                    
                    const hashed =  hashPassword(password) //double hash because password is expected to be pre hashed on the client
                    foundConfig.password = await bcrypt.hash(hashed, BCRYPT_ROUNDS);

                    await manager.save(foundConfig);

                    Logger.warn(`Default admin panel password for this session <${password}>. Please set a proper password in the admin panel`, "AppConfig");
                    Logger.warn(`Remove the environment variable after setting a new password. Keep in mind only the most recent logged password of an instance is valid`, "AppConfig");
                }
                /* istanbul ignore if  */ // won't be executed in tests with in-memory db
                else if(!foundConfig.passwordInitialised)
                {
                    Logger.warn(`No proper password set for instanceId <${instanceId}>, initialising temp password...`, "AppConfig");
                    
                    const password = await customAlphabet(PASSWORD_ALPHABET, DEFAULT_PW_LENGTH)();
                    const hashed =  hashPassword(password) //double hash because password is expected to be pre hashed on the client
                    
                    foundConfig.password = await bcrypt.hash(hashed, BCRYPT_ROUNDS);
    
                    await manager.save(foundConfig);

                    Logger.warn(`Default admin panel password for this session <${password}>. Please set a proper password in the admin panel`, "AppConfig");
                    Logger.warn(`Keep in mind only the most recent logged password of an instance is valid`, "AppConfig");
                }
                /* istanbul ignore else */ // won't be executed in tests with in-memory db
                else
                {
                    Logger.log(`AppConfig initialised.`, "AppConfig");
                }

                 /* istanbul ignore if */ // only used for e2e tests
                if(process.env.E2E_PW_OVERRIDE)
                {
                    const overrideConfig = await manager.findOne(AppConfig, {
                        where: { instanceId: instanceId }
                    });

                    const hashed = hashPassword(process.env.E2E_PW_OVERRIDE) //double hash because password is expected to be pre hashed on the client
                    overrideConfig.password = await bcrypt.hash(hashed, BCRYPT_ROUNDS);
                    overrideConfig.passwordInitialised = false;

                    await manager.save(overrideConfig);
                }
    
            });
        } 
        catch(err)
        {
            //Other instance inserted before this one? 
            const foundConfig = await this.appConfigRepository.findOne({
                select: ["passwordInitialised"],
                where: { instanceId: instanceId }
            });

            /* istanbul ignore if  */ // won't throw in tests with in-memory db
            if(foundConfig?.passwordInitialised)
            {
                Logger.log(`AppConfig initialised.`, "AppConfig");
            }
            /* istanbul ignore else */ // won't throw in tests with in-memory db
            else 
            {
                Logger.error(`Could not initialise password for instanceId <${instanceId}>`, err.message || err.name, "AppConfig", true);
            }        
        }

        await this.memoizedAppConfig(); //pre fetch app config
    }

    /**
     * Updates the current configuration
     * @throws if password does not fulfil min length or if any banlist partner does not have a valid URL
     * @param config 
     */
    async createUpdateAppConfig(config: AppConfig): Promise<AppConfig>
    {
        config = new AppConfig({...config});

        if(!config.instanceId)
        {
            config.instanceId = this.configService.get<string>('instanceId');
        }
        
        if(config.banlistPartners)
        {
            config.banlistPartners = _.uniq(config.banlistPartners);
            if(config.banlistPartners.some(x => x.includes(',')))
            {
                throw new HttpException("Char not allowed ','", HttpStatus.NOT_ACCEPTABLE);
            }
            config.banlistPartners.forEach(toBeValidated => {if(!isURL(toBeValidated)) throw new HttpException(`No valid URL: "${toBeValidated}"`, HttpStatus.NOT_ACCEPTABLE)});
        }     

        if(config.ownAddress?.trim() && !isURL(config.ownAddress)) {
            throw new HttpException(`No valid URL: "${config.ownAddress}"`, HttpStatus.NOT_ACCEPTABLE);
        } 



        if(config.password)
        {
            if(config.password.length < MIN_PW_LENGTH)
            {
                throw new HttpException(`Password needs to have at least ${MIN_PW_LENGTH} characters.`, HttpStatus.BAD_REQUEST);
            }
            else if(config.password.length > MAX_PW_LENGTH)
            {
                throw new HttpException(`Password can't be longer than ${MAX_PW_LENGTH} characters.`, HttpStatus.BAD_REQUEST);
            }

            config.password = await bcrypt.hash(config.password, BCRYPT_ROUNDS);
            config.passwordInitialised = true;
        }

        await this.appConfigRepository.save(config)

        this.memoizedAppConfig.clear(); //wipe cache to be filled with updated info again
        const updated = await this.memoizedAppConfig();
        return updated;
    }
}
