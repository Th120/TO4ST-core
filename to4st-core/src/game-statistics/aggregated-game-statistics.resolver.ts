import { Resolver, ObjectType, InputType, Query, Field, Int, Args, Parent, ResolveField } from '@nestjs/graphql';
import { ValidateIf, IsInt, IsBoolean, IsString, IsDate, } from 'class-validator';
import { UseInterceptors, UseGuards, UsePipes, ValidationPipe, } from '@nestjs/common';


import { PublicStatisticsInterceptor } from '../shared/public-statistics.interceptor';
import { AuthGuard } from '../shared/auth.guard';
import { Paginated } from '../shared/paginated';
import { GameMode } from './game-mode.entity';
import { Round } from './round.entity';
import { Game } from './game.entity';
import { SteamUser } from '../core/steam-user.entity';
import { SteamUserService } from '../core/steam-user.service';
import { AggregatedGameStatisticsService } from './aggregated-game-statistics.service';
import { MinRole, Role, AllowFieldResolversForAllRoles, AllowTacByteAccess } from '../shared/auth.utils';
import { PlayerWeaponStatistics } from './player-weapon-statistics';
import { PlayerStatistics, OrderPlayerBaseStats } from './player-statistics';

/**
 * Input type used to query player statistics
 */
@InputType()
class PlayerStatisticsQuery
{
    /**
     * Filter for certain player by steamId64
     */
    @ValidateIf(x => x.steamId64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    steamId64?: string; 

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
     * Should be ordered descending?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;

    /**
     * Order stats by field
     */
    @ValidateIf(x => x.orderBy !== undefined)
    @IsString()
    @Field(() => OrderPlayerBaseStats, {nullable: true})
    orderBy?: OrderPlayerBaseStats;

    /**
     * Filter matches of gameMode
     */
    @ValidateIf(x => x.gameModeName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameModeName?: string;

    /**
     * Filter stats of round
     */
    @ValidateIf(x => x.roundId !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    roundId?: number;

    /**
     * Filter stats of match
     */
    @ValidateIf(x => x.gameId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameId?: string;

    /**
     * Only get stats from rounds which were started after date
     */
    @ValidateIf(x => x.startedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedAfter?: Date;

    /**
     * Only get stats from rounds which were started before date
     */
    @ValidateIf(x => x.startedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedBefore?: Date;

    /**
     * Only get stats from rounds which were ended after date
     */
    @ValidateIf(x => x.endedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedAfter?: Date;

    /**
     * Only get stats from rounds which were ended before date
     */
    @ValidateIf(x => x.endedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedBefore?: Date;

    /**
     * Filter for only finished rounds
     */
    @ValidateIf(x => x.onlyFinishedRounds !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    onlyFinishedRounds?: boolean;

    /**
     * Should return from cached stats, only sortBy possible params
     */
    @ValidateIf(x => x.cachedIfPossible !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true, description: "Only possible if only using sorts"})
    cachedIfPossible?: boolean;
}

/**
 * Input type used to query player weapon statistics
 */
@InputType()
class PlayerWeaponStatisticsQuery
{
    /**
     * SteamId64 of player
     */
    @IsString()
    @Field(() => String, {nullable: true})
    steamId64!: string;

    /**
     * Only aggregate from games with certain gameMode
     */
    @ValidateIf(x => x.gameModeName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameModeName?: string;

    /**
     * Only aggregate from certain round
     */
    @ValidateIf(x => x.roundId !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    roundId?: number;

    /**
     * Only aggregate from certain match
     */
    @ValidateIf(x => x.gameId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameId?: string;

    /**
     * Only get stats from rounds which were started after date
     */
    @ValidateIf(x => x.startedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedAfter?: Date;

    /**
     * Only get stats from rounds which were started before date
     */
    @ValidateIf(x => x.startedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedBefore?: Date;

    /**
     * Only get stats from rounds which were ended after date
     */
    @ValidateIf(x => x.endedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedAfter?: Date;

    /**
     * Only get stats from rounds which were ended before date
     */
    @ValidateIf(x => x.endedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedBefore?: Date;

    /**
     * Filter for only finished rounds
     */
    @ValidateIf(x => x.onlyFinishedRounds !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    onlyFinishedRounds?: boolean;
}

/**
 * Wrapper type used for pagination of playerWeaponStatistics
 */
@ObjectType()
class PaginatedPlayerWeaponStatistics extends Paginated(PlayerWeaponStatistics) {}

/**
 * Wrapper type used for pagination of playerStatistics
 */
@ObjectType()
class PaginatedPlayerStatistics extends Paginated(PlayerStatistics) {}

/**
 * Resolver of playerStatistics type
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => PlayerStatistics)
export class PlayerStatisticsResolver {
    
    constructor(private readonly statsService: AggregatedGameStatisticsService, private readonly steamUserService: SteamUserService)
    {
    }
       
    /**
     * Get player statistics
     * @param options 
     */
    @AllowTacByteAccess()
    @MinRole(Role.none)
    @Query(() => PaginatedPlayerStatistics)
    async playerStatistics(@Args({name: "options", type: () => PlayerStatisticsQuery}) options: PlayerStatisticsQuery)
    {
        const [playerStats, count, pageCount] = await this.statsService.getPlayerStatistics({
            steamId64: options.steamId64,
            page: options.page,
            pageSize: options.pageSize,
            startedAfter: options.startedAfter,
            startedBefore: options.startedBefore,
            game: options.gameId ? new Game({id: options.gameId}) : undefined,
            round: options.roundId ? new Round({id: options.roundId}) : undefined,
            orderBy: options.orderBy,
            gameMode: options.gameModeName ? new GameMode({name: options.gameModeName}) : undefined,
            endedAfter: options.endedAfter,
            endedBefore: options.endedBefore,
            orderDesc: options.orderDesc,
            onlyFinishedRounds: options.onlyFinishedRounds,
            cached: options.cachedIfPossible
        });
        
        return { content: playerStats, totalCount: count, pageCount: pageCount};
    }

    /**
     * Field resolver used for steam user data of playerStats entry
     * @param stats 
     */
    @AllowTacByteAccess()
    @MinRole(Role.none)
    @AllowFieldResolversForAllRoles()
    @ResolveField("steamUser", returns => SteamUser, {nullable: true})
    async steamUser(@Parent() stats: PlayerStatistics) 
    {
        const found = await this.steamUserService.getSteamUsers([stats.steamId64]);
        return found.length > 0 ? found[0] : null;
    }
}

/**
 * Resolver of playerWeaponStatistics type
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => PlayerWeaponStatistics)
export class PlayerWeaponStatisticsResolver {
    
    constructor(private readonly statsService: AggregatedGameStatisticsService, private readonly steamUserService: SteamUserService)
    {
    }

    /**
     * Get weapon statistics of player
     * @param options 
     */
    @AllowTacByteAccess()
    @MinRole(Role.none)
    @Query(() => [PlayerWeaponStatistics])
    async playerWeaponStatistics(@Args({name: "options", type: () => PlayerWeaponStatisticsQuery}) options: PlayerWeaponStatisticsQuery)
    {
        const stats = await this.statsService.getPlayerWeaponStatistics({
            steamId64: options.steamId64,
            startedAfter: options.startedAfter,
            startedBefore: options.startedBefore,
            endedAfter: options.endedAfter,
            endedBefore: options.endedBefore,
            game: options.gameId ? new Game({id: options.gameId}) : undefined,
            round: options.roundId ? new Round({id: options.roundId}) : undefined,
            gameMode: options.gameModeName ? new GameMode({name: options.gameModeName}) : undefined,
        });
        
        return stats;
    }

    /**
     * Field resolver used for steam user data of playerWeaponStats entry
     * @param stats 
     */
    @AllowTacByteAccess()
    @MinRole(Role.none)
    @AllowFieldResolversForAllRoles()
    @ResolveField("steamUser", returns => SteamUser, {nullable: true})
    async steamUser(@Parent() stats: PlayerWeaponStatistics) 
    {
        const found = await this.steamUserService.getSteamUsers([stats.steamId64]);
        return found.length > 0 ? found[0] : null;
    }
       
    
}
