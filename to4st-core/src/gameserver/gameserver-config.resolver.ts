import { Resolver, Query, Mutation, Args, InputType, Field, Int, ObjectType, Float } from '@nestjs/graphql';
import { ValidateIf, IsInt, IsString, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';


import { GameserverService } from './gameserver.service';
import { AuthGuard } from '../shared/auth.guard';
import { Gameserver } from './gameserver.entity';
import { Paginated } from '../shared/paginated';
import { Role, AllowTacByteAccess, OnlyRole, RequestingGameserver, RequiredAuthPlayerRoles, AuthPlayerRole } from '../shared/auth.utils';
import { TransactionInterceptor } from '../shared/transaction.interceptor';
import { GameserverConfig } from './gameserver-config.entity';
import { GameserverConfigService } from './gameserver-config.service';
import { MatchConfig } from './match-config.entity';
import { GameModeInput } from '../game-statistics/game-statistics.resolver';
import { GameMode } from '../game-statistics/game-mode.entity';
import { GameStatisticsService } from '../game-statistics/game-statistics.service';


/**
 * Wrapper type used for pagination of gameserver configs
 */
@ObjectType()
class PaginatedGameserverConfig extends Paginated(GameserverConfig) {}


/**
 * Wrapper type used for pagination of match configs
 */
@ObjectType()
class PaginatedMatchConfig extends Paginated(MatchConfig) {}

/**
 * Input type for gameserver config
 */
@InputType()
class GameserverConfigInput
{
    /**
     * Id of gameserver, is uuid should be unique globally
     */
    @IsString()
    @Field(() => String)
    gameserverId: string;

    /**
     * Id of ini used by gameserver
     */
    @ValidateIf(x => x.currentMatchConfigId !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    currentMatchConfigId?: number;

    /**
     * Current gameserver name
     */
    @ValidateIf(x => x.currentGameserverName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    currentGameserverName?: string;

    /**
     * Current vote length
     */
    @ValidateIf(x => x.voteLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    voteLength: number;

    /**
     * Time in min a player is banned
     */
    @ValidateIf(x => x.tempKickBanTime !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    tempKickBanTime: number;

    /**
     * Private game / reserved slots password
     */
    @ValidateIf(x => x.gamePassword !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gamePassword?: string;

    /**
     * List of server admins / owner to display
     */
    @ValidateIf(x => x.serverAdmins !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    serverAdmins?: string;

    /**
     * Server description
     */
    @ValidateIf(x => x.serverDescription !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    serverDescription?: string;

     /**
     * Website which is associated with the server
     */
    @ValidateIf(x => x.website !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    website?: string;

    /**
     * Contact information
     */
    @ValidateIf(x => x.contact !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    contact?: string;

    /**
     * Current number of reserved slots
     */
    @ValidateIf(x => x.reservedSlots !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    reservedSlots: number;

    /**
     * Skip map for n games after being played
     */
    @ValidateIf(x => x.mapNoReplay !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    mapNoReplay: number;

    /**
     * Balance players by clantag if using random join
     */
    @ValidateIf(x => x.balanceClans !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    balanceClans?: boolean;

    /**
     * Players can vote to skip the map (seperated from player game control for more freedom)
     */
    @ValidateIf(x => x.allowSkipMapVote !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    allowSkipMapVote?: boolean;

    /**
     * Record replay for every match (server side)
     */
    @ValidateIf(x => x.allowSkipMapVote !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    autoRecordReplay?: boolean;

    /**
     * Players can vote to pause the game, reset to a different round or the match itself
     */
    @ValidateIf(x => x.playerGameControl !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    playerGameControl?: boolean;

    /**
     * Enable map vote after game 
     */
    @ValidateIf(x => x.enableMapVote !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    enableMapVote?: boolean;

    /**
     * Enable voicechat on gameserver
     */
    @ValidateIf(x => x.enableVoicechat !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    enableVoicechat?: boolean;
}

/**
 * Input type for match config
 */
@InputType()
class MatchConfigInput
{
    /**
     * Config id
     */
    @ValidateIf(x => x.id !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    id: number;

    /**
     * Config name
     */
    @ValidateIf(x => x.configName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    configName?: string;

    /**
     * Current gamemode
     */
    @ValidateIf(x => x.gameMode !== undefined)
    @ValidateNested()
    @Field(() => GameModeInput, {nullable: true})
    gameMode?: GameModeInput;

    /**
     * Time the scoreboard is shown (etc) after a game is finished in s
     */
    @ValidateIf(x => x.matchendLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    matchEndLength: number;

    /**
     * WarmUp length in s
     */
    @ValidateIf(x => x.warmUpLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    warmUpLength: number;

    /**
     * Map length in min
     */
    @ValidateIf(x => x.mapLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    mapLength: number;

    /**
     * Round length in s
     */
    @ValidateIf(x => x.roundLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    roundLength: number;

    /**
     * Pre round length in s
     */
    @ValidateIf(x => x.preRoundLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    preRoundLength: number;

    /**
     * Time at the end of a round in s
     */
    @ValidateIf(x => x.roundEndLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    roundEndLength: number;

    /**
     * Round limit
     */
    @ValidateIf(x => x.roundLimit !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    roundLimit: number;

    /**
     * Additional delay after teams are swapped and the other half of a team based game starts
     */
    @ValidateIf(x => x.midGameBreakLength !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    midGameBreakLength: number;

    /**
     * Friendly fire in %
     */
    @ValidateIf(x => x.friendlyFireScale !== undefined)
    @IsNumber()
    @Field(() => Float, {nullable: true})
    friendlyFireScale: number;

    /**
     * Min % of votes for a temp kick ban
     */
    @ValidateIf(x => x.playerVoteThreshold !== undefined)
    @IsNumber()
    @Field(() => Float, {nullable: true})
    playerVoteThreshold: number;

    /**
     * Team damage before temp kickban
     */
    @ValidateIf(x => x.maxTeamDamage !== undefined)
    @IsNumber()
    @Field(() => Float, {nullable: true})
    maxTeamDamage: number;

    /**
     * Enable ghostcam
     */
    @ValidateIf(x => x.allowGhostcam !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    allowGhostcam?: boolean;

    /**
     * Balance teams for even team number
     */
    @ValidateIf(x => x.autoBalanceTeams !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    autoBalanceTeams?: boolean;

    /**
     * All players or only players in the team can be voted
     */
    @ValidateIf(x => x.playerVoteTeamOnly !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    playerVoteTeamOnly?: boolean;

    /**
     * Enable player vote
     */
    @ValidateIf(x => x.enablePlayerVote !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    enablePlayerVote?: boolean;

    /**
     * Auto swap teams after half of the rounds of the round limit are finished
     */
    @ValidateIf(x => x.autoSwapTeams !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    autoSwapTeams?: boolean;

    /**
     * Only allow buying one nade of each kind per round
     */
    @ValidateIf(x => x.nadeRestriction !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    nadeRestriction?: boolean;

    /**
     * Global voicechat on server
     */
    @ValidateIf(x => x.globalVoicechat !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    globalVoicechat?: boolean;

    /**
     * Mute voicechat of dead team members
     */
    @ValidateIf(x => x.muteDeadToTeam !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    muteDeadToTeam?: boolean;

    /**
     * Is a ranked match
     */
    @ValidateIf(x => x.ranked !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    ranked?: boolean;
    
    /**
     * Is a private match (at least password protected or reserved slots only)
     */
    @ValidateIf(x => x.private !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    private?: boolean;
}

/**
 * Input type for gameserver query
 */
@InputType()
class GameserverConfigQuery
{
    /**
     * Id of gameserver, is uuid should be unique globally
     */
    @ValidateIf(x => x.id !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id?: string;

    /**
     * AuthKey of gameserver
     */
    @ValidateIf(x => x.authKey !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    authKey?: string;

}

/**
 * Input type for match config query
 */
@InputType()
class MatchConfigQuery
{
    /**
     * Id of match config
     */
    @ValidateIf(x => x.id !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    id?: number;

    /**
    * Name of the configuration preset
    */
    @ValidateIf(x => x.configName !== undefined)
    @IsString()
    @Field(() => Int, {nullable: true})
    configName?: string;
}

/**
 * Input type for gameservers query
 */
@InputType()
class GameserverConfigsQuery
{
    /**
     * Desired page
     */
    @ValidateIf(x => x.page !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    page?: number;

    /**
     * Desired page size
     */
    @ValidateIf(x => x.pageSize !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    pageSize?: number;

    /**
     * Searches for steamId64, banned by steamId64, id1, id2, reason or gameserverId
     */
    @ValidateIf(x => x.search !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    search?: string;

    /**
     * Should be ordered descending by matchconfig name?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;

    /**
     * Should order by gameserver name
     */
    @ValidateIf(x => x.orderByGameserverName !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderByGameserverName: boolean;
}

/**
 * Input type for match configs query
 */
@InputType()
class MatchConfigsQuery
{
    /**
     * Desired page
     */
    @ValidateIf(x => x.page !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    page?: number;

    /**
     * Desired page size
     */
    @ValidateIf(x => x.pageSize !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    pageSize?: number;

    /**
     * Searches for preset name
     */
    @ValidateIf(x => x.configName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    configName?: string;

    /**
     * Should be ordered descending by matchconfig name?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;
}

/**
 * Resolver of gameserver config
 */
@Resolver(() => GameserverConfig)
export class GameserverConfigResolver {

    constructor(private readonly gameserverConfigService: GameserverConfigService,)
    {
    }

    /**
     * Get gameserver configs
     * @param options 
     */
    @Query(() => PaginatedGameserverConfig)
    @AllowTacByteAccess()
    async gameserverConfigs(@Args({name: "options", type: () => GameserverConfigsQuery}) options: GameserverConfigsQuery): Promise<PaginatedGameserverConfig>
    {
        const [configs, count, pageCount] = await this.gameserverConfigService.getGameserverConfigs({
            page: options.page,
            pageSize: options.pageSize,
            search: options.search,
            orderDesc: options.orderDesc,
            orderByGameserverName: options.orderByGameserverName
        });
        
        return { content: configs, totalCount: count , pageCount: pageCount};
    }

    /**
     * Get gameserver config
     * @param options 
     */
    @Query(() => GameserverConfig)
    @AllowTacByteAccess()
    async gameserverConfig(@Args({name: "options", type: () => GameserverConfigQuery}) options: GameserverConfigQuery)
    {
        return await this.gameserverConfigService.getGameserverConfig(options.id ? {id: options.id} : {authKey: options.authKey});
    }

    /**
     * Delete gameserver config
     * @param gameserverId 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => Boolean)
    async deleteGameserverConfig(@Args("gameserverId") gameserverId: string)
    {
        await this.gameserverConfigService.deleteGameserverConfig({id: gameserverId});
        return true;
    }

    /**
     * Create or update gameserver config
     * @param gameserverConfig 
     */
    @OnlyRole(Role.admin)
    async createUpdateGameserverConfig(@Args({name: "gameserverConfig", type: () => GameserverConfigInput}) gameserverConfig: GameserverConfigInput)
    {
        const nuGameserverConfig = new GameserverConfig({
            gameserver: new Gameserver({id: gameserverConfig.gameserverId}),
            currentName: gameserverConfig.currentGameserverName,
            currentMatchConfig: gameserverConfig.currentMatchConfigId ? new MatchConfig({id: gameserverConfig.currentMatchConfigId}) : undefined,
            voteLength: gameserverConfig.voteLength,
            gamePassword: gameserverConfig.gamePassword,
            reservedSlots: gameserverConfig.reservedSlots,
            balanceClans: gameserverConfig.balanceClans,
            allowSkipMapVote: gameserverConfig.allowSkipMapVote,
            tempKickBanTime: gameserverConfig.tempKickBanTime,
            autoRecordReplay: gameserverConfig.autoRecordReplay,
            playerGameControl: gameserverConfig.playerGameControl,
            enableMapVote: gameserverConfig.enableMapVote,
            serverAdmins: gameserverConfig.serverAdmins,
            serverDescription: gameserverConfig.serverDescription,
            website: gameserverConfig.website,
            contact: gameserverConfig.contact,
            mapNoReplay: gameserverConfig.mapNoReplay,
            enableVoicechat: gameserverConfig.enableVoicechat
        });
        const ret = await this.gameserverConfigService.createUpdateGameserverConfig(nuGameserverConfig);
        return ret;
    }

    @Mutation(() => GameserverConfig, {description: "Used to assign MatchConfig and password to a server from the game by an authed player"})
    @RequiredAuthPlayerRoles([AuthPlayerRole.gameControl])
    async assignMatchConfig(@Args({name: "gameserverConfig", type: () => GameserverConfigInput}) gameserverConfig: GameserverConfigInput)
    {
        const existingConfig = await this.gameserverConfigService.getGameserverConfig(new Gameserver({id: gameserverConfig.gameserverId}));
        if(!existingConfig)
        {
            throw new HttpException("Gameserver must have an existing gameserver config", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const nuGameserverConfig = new GameserverConfig({
            gameserver: new Gameserver({id: gameserverConfig.gameserverId}),
            currentMatchConfig: gameserverConfig.currentMatchConfigId ? new MatchConfig({id: gameserverConfig.currentMatchConfigId}) : undefined,
            gamePassword: gameserverConfig.gamePassword
        });

        const ret = await this.gameserverConfigService.createUpdateGameserverConfig(nuGameserverConfig);
        return ret;
    }

}

/**
 * Resolver of gameserver config
 */
@Resolver(() => MatchConfig)
export class MatchConfigResolver {

    constructor(private readonly gameserverConfigService: GameserverConfigService, private readonly gameStatisticsService: GameStatisticsService)
    {
    }

    /**
     * Get gameserver configs
     * @param options 
     */
    @Query(() => PaginatedMatchConfig)
    @RequiredAuthPlayerRoles([AuthPlayerRole.gameControl])
    @AllowTacByteAccess()
    async matchConfigs(@Args({name: "options", type: () => MatchConfigsQuery}) options: MatchConfigsQuery): Promise<PaginatedMatchConfig>
    {
        const [configs, count, pageCount] = await this.gameserverConfigService.getMatchConfigs({
            page: options.page,
            pageSize: options.pageSize,
            configName: options.configName,
            orderDesc: options.orderDesc,
        });
        
        return { content: configs, totalCount: count , pageCount: pageCount};
    }

    /**
     * Get gameserver config
     * @param options 
     */
    @Query(() => MatchConfig)
    @AllowTacByteAccess()
    @RequiredAuthPlayerRoles([AuthPlayerRole.gameControl])
    async matchConfig(@Args({name: "options", type: () => MatchConfigQuery}) options: MatchConfigQuery)
    {
        return await this.gameserverConfigService.getMatchConfig({id: options.id, configName: options.configName});
    }

    /**
     * Delete match config
     * @param options 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => Boolean)
    async deleteMatchConfig(@Args({name: "options", type: () => MatchConfigQuery}) options: MatchConfigQuery)
    {
        await this.gameserverConfigService.deleteMatchConfig({id: options.id, configName: options.configName});
        return true;
    }

    /**
     * Create or update match config
     * @param matchConfig 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => MatchConfig, {description: "X-Request-ID must be set in header"})
    @UseInterceptors(TransactionInterceptor)
    async createUpdateMatchConfig(@Args({name: "matchConfig", type: () => MatchConfigInput}) matchConfig: MatchConfigInput)
    {
        let gameMode = null;

        if(matchConfig.gameMode?.name)
        {
            gameMode = await this.gameStatisticsService.getGameMode({name: matchConfig.gameMode.name});

            if(!gameMode)
            {
                throw new HttpException(`GameMode <${matchConfig.gameMode.name}> does not exist`, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        const nuMatchConfig = new MatchConfig({
            id: matchConfig.id,
            gameMode: gameMode ? new GameMode({id: gameMode.id}) : undefined,
            configName: matchConfig.configName,
            matchEndLength: matchConfig.matchEndLength,
            warmUpLength: matchConfig.warmUpLength,
            friendlyFireScale: matchConfig.friendlyFireScale,
            mapLength: matchConfig.mapLength,
            roundLength: matchConfig.roundLength,
            preRoundLength: matchConfig.preRoundLength,
            roundEndLength: matchConfig.roundEndLength,
            roundLimit: matchConfig.roundLimit,
            allowGhostcam: matchConfig.allowGhostcam,
            playerVoteThreshold: matchConfig.playerVoteThreshold,
            autoBalanceTeams: matchConfig.autoBalanceTeams,
            playerVoteTeamOnly: matchConfig.playerVoteTeamOnly,
            maxTeamDamage: matchConfig.maxTeamDamage,
            enablePlayerVote: matchConfig.enablePlayerVote,
            autoSwapTeams: matchConfig.autoSwapTeams,
            midGameBreakLength: matchConfig.midGameBreakLength,
            nadeRestriction: matchConfig.nadeRestriction,
            globalVoicechat: matchConfig.globalVoicechat,
            muteDeadToTeam: matchConfig.muteDeadToTeam,
            ranked: matchConfig.ranked,
            private: matchConfig.ranked
        });
        const ret = await this.gameserverConfigService.createUpdateMatchConfig(nuMatchConfig);
        return ret;
    }
}

