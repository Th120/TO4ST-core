import { Resolver, Query, Mutation, Args, InputType, Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ValidateIf, IsString, IsBoolean, IsUrl, } from 'class-validator';
import { Expose } from 'class-transformer';


import { AppConfig } from './app-config.entity';
import { AuthGuard } from '../shared/auth.guard';
import { MinRole, Role, AuthRole, AllowFieldResolversForAllRoles } from '../shared/auth.utils';
import { GameStatisticsService } from '../game-statistics/game-statistics.service';
import { BanService } from '../gameserver/ban.service';
import { AggregatedGameStatisticsService } from '../game-statistics/aggregated-game-statistics.service';
import { AppConfigService, } from './app-config.service';

/**
 * InputType for AppConfiguration
 */
@InputType()
export class AppConfigInput {
   
    /**
     * Does this backend offer public player statistics?
     */
    @ValidateIf(x => x.publicStats !== undefined)
    @Field(() => Boolean, {nullable: true})
    @IsBoolean()
    publicStats?: boolean;
  
    /**
    * List of banlist partner backends (URLs), which are queried when a gameserver requests a player ban
    */
    @ValidateIf(x => x.banlistPartners !== undefined)
    @Field(() => [String], {nullable: true})
    @IsString({each: true})
    banlistPartners?: string[];
  
    /**
     * Can other backends contact this one to check for the ban-status of a certain player?
     */
    @ValidateIf(x => x.publicBanQuery !== undefined)
    @Field(() => Boolean, {nullable: true})
    @IsBoolean()
    publicBanQuery?: boolean;
  
    /**
     * MasterserverKey used to authenticate when sending hearbeat to masterserver (optional)
     */
    @ValidateIf(x => x.masterserverKey !== undefined)
    @Field(() => String, {nullable: true})
    @IsString()
    masterserverKey?: string;

    /**
     * Steam Web API Key used to query steam userdata (optional)
     */
    @ValidateIf(x => x.steamWebApiKey !== undefined)
    @Field(() => String, {nullable: true})
    @IsString()
    steamWebApiKey?: string;

    /**
     * Address sent to the masterserver in order to contact this backend (use it if you are behind a reverse proxy and / or use https)
     */
    @ValidateIf(x => x.ownAddress !== undefined)
    @Field(() => String, {nullable: true})
    @IsUrl({protocols: ['http','https'], require_valid_protocol: true,})
    ownAddress?: string;
  
    /**
     * New admin password
     */
    @ValidateIf(x => x.password !== undefined)
    @Field(() => String, {nullable: true})
    @IsString()
    password?: string;
  
    constructor(partial: Partial<AppConfigInput>) {
      Object.assign(this, partial);
    }
}

/**
 * AppInfo Type used to share information about the state of the application
 */
@ObjectType()
export class AppInfo
{
    /**
     * Number of games saved in the database
     */
    @Field(() => Int)
    @Expose()
    gamesPlayed: number;

    /**
     * Number of rounds saved in the database
     */
    @Field(() => Int)
    @Expose()
    roundsPlayed: number;

    /**
     * Currently active bans on this backend
     */
    @Field(() => Int)
    @Expose()
    activeBans: number;

    /**
     * Number of unique players who played on the connected servers
     */
    @Field(() => Int)
    @Expose()
    uniquePlayers: number;

    constructor(partial: Partial<AppInfo>) 
    {
        Object.assign(this, partial);
    }
}


/**
 * Resolver for AppConfiguration ObjectType
 */
@Resolver(() => AppConfig)
export class AppConfigResolver {
    constructor(private readonly appConfigService: AppConfigService, private readonly banService: BanService, private readonly statsService: GameStatisticsService, private readonly aggregatedStatsService: AggregatedGameStatisticsService)
    {
    }

    /**
     * Get app configuration
     * @param role Role associated with the request
     * @param cached Should retrieve a cached version?
     */
    @MinRole(Role.none)
    @Query(() => AppConfig)
    async appConfig(@AuthRole() role: Role, @Args("cached",{defaultValue: true, type: () => Boolean }) cached: boolean): Promise<AppConfig>
    {
        const res = await this.appConfigService.getAppConfig(role === Role.authKey ? cached : true);
        return res;
    }

    /**
     * Field Resolver for app information
     * @param appCfg Parent appConfig
     */
    @MinRole(Role.none)
    @AllowFieldResolversForAllRoles()
    @ResolveField("appInfo", returns => AppInfo)
    async appInfo(@Parent() appCfg: AppConfig) 
    {
        const [numberPlayers, numberActiveBans, numberGames, numberRounds] = await Promise.all(
            [
                this.aggregatedStatsService.getCountUniquePlayersCached(), 
                this.banService.getNumberOfActiveBansCached(), 
                this.statsService.getNumberOfGamesCached(), 
                this.statsService.getNumberOfRoundsCached()
            ]);

        return new AppInfo({gamesPlayed: numberGames, roundsPlayed: numberRounds, uniquePlayers: numberPlayers, activeBans: numberActiveBans})
    }

    /**
     * Update app configuration
     * @param appConfig 
     */
    @Mutation(() => AppConfig)
    async updateAppConfig(@Args({name: "appConfig", type: () => AppConfigInput}) appConfig: AppConfigInput): Promise<AppConfig>
    {
        const config = new AppConfig(
            {
                publicStats: appConfig.publicStats, 
                banlistPartners: appConfig.banlistPartners, 
                publicBanQuery: appConfig.publicBanQuery, 
                masterserverKey: appConfig.masterserverKey, 
                steamWebApiKey: appConfig.steamWebApiKey,
                password: appConfig.password,
                ownAddress: appConfig.ownAddress
            });
        const ret = await this.appConfigService.createUpdateAppConfig(config);
        return ret;
    }
}

