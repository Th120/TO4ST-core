/* istanbul ignore file */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import publicIp from 'public-ip';
import { ConfigService } from '@nestjs/config';


import { AppConfigService } from './app-config.service';
import { createGraphqlClientTo4stMaster } from '../libs/client/graphql-client-to4st-master';

/**
 * Delay between heartbeats
 */
const HEARBEAT_INTERVAL = 1000 * 60 * 4;

/**
 * Default masterserver URL
 */
const MASTERSERVER_URL = "https://to4st-master.to4.co";

/**
 * Default masterserver URL for development
 */
const MASTERSERVER_URL_DEVELOPMENT = "http://127.0.0.1:3001";

/**
 * Class used to send current address of a backend to the masterserver
 */
@Injectable()
export class MasterHeartbeatService implements OnApplicationBootstrap
{
    
    constructor(private readonly appConfigService: AppConfigService, private readonly cfgService: ConfigService,)
    {
        
    }

    /**
     * Interval of heartbeats
     */
    private beatInterval: NodeJS.Timeout;

    /**
     * Used to prevent service being initialized more than once
     */
    private initialized = false;

    /**
     * Inits service on application start
     */
    public async onApplicationBootstrap()
    {
        if(process.env.NODE_ENV !== "test") // makes no sense during e2e tests
        {
            this.initHeartbeats();
        }
    }

    /**
     * Initialize hearbeat service
     */
    private initHeartbeats(): void
    {
        if(!this.initialized)
        {
            this.heartbeatLoop().catch(e => Logger.error(`Failed initializing`, e, "MasterHeartbeatService"));
        }
        
        this.initialized = true;
    }
 
    /**
     * Sets up infinite heartbeat cycle, starts next interval after heartbeat is sent
     */
    private async heartbeatLoop(): Promise<void>
    {
        const appCfg = await this.appConfigService.getAppConfig(false);
        const masterserverKey = appCfg.masterserverKey;

        if(masterserverKey)
        {
            const masterServer = process.env.NODE_ENV === "development" ? MASTERSERVER_URL_DEVELOPMENT : MASTERSERVER_URL;

            const client = createGraphqlClientTo4stMaster(masterServer, masterserverKey);
            const ownAddress = process.env.NODE_ENV === "development" ? `http://127.0.0.1:${this.cfgService.get<number>("port")}` : appCfg.ownAddress;
            const address = ownAddress || `http://${await publicIp.v4()}:${this.cfgService.get<number>("port")}`;

            try
            {
                await client.chain.mutation.heartBeat({address: address}).execute(false);
            }
            catch(e)
            {
                Logger.error("Could not send heartbeat to master server", e, "MasterHeartbeatService");
            }
            
        }

        this.beatInterval = setTimeout(async () => {
            await this.heartbeatLoop();
        }, HEARBEAT_INTERVAL);
    }

  
}
