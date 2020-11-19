import { Resolver, ObjectType, InputType, Query, Field, Int, Args, Mutation, Parent, Float, ResolveField } from '@nestjs/graphql';
import { UseInterceptors, UseGuards, UsePipes, ValidationPipe, HttpException, HttpStatus, } from '@nestjs/common';
import { ValidateIf, IsInt, IsBoolean, IsString, IsDate, IsNumber, ValidateNested } from 'class-validator';


import { Game } from './game.entity';
import { PublicStatisticsInterceptor } from '../shared/public-statistics.interceptor';
import { AuthGuard } from '../shared/auth.guard';
import { GameStatisticsService, } from './game-statistics.service';
import { Paginated } from '../shared/paginated';
import { GameMode } from './game-mode.entity';
import { Gameserver } from '../gameserver/gameserver.entity';
import { RequestingGameserver, MinRole, Role, AllowFieldResolversForAllRoles, AllowTacByteAccess } from '../shared/auth.utils';
import { ServerMap } from './server-map.entity';
import { Round } from './round.entity';
import { PlayerRoundStats } from './player-round-stats.entity';
import { Team } from '../shared/utils';
import { WeaponType, Weapon } from './weapon.entity';
import { PlayerRoundWeaponStats } from './player-round-weapon-stats.entity';
import { SteamUser } from '../core/steam-user.entity';
import { SteamUserService } from '../core/steam-user.service';
import { TransactionInterceptor } from '../shared/transaction.interceptor';


/**
 * Input type for a map
 */
@InputType()
class ServerMapInput
{
    /**
     * Map name
     */
    @IsString()
    @Field(() => String)
    name!: string;
}

/**
 * Input type used for gameMode
 */
@InputType()
export class GameModeInput
{
    /**
     * Name of gameMode
     */
    @IsString()
    @Field(() => String)
    name!: string;

    /**
     * Is this gameMode based on teams?
     */
    @ValidateIf(x => x.isTeamBased !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    isTeamBased!: boolean;
}


/**
 * Input type used to query for games
 */
@InputType()
class GameQuery
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
     * Should be ordered descending?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;

    /**
     * Should be ordered descending?
     */
    @ValidateIf(x => x.orderByEndedAt !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderByEndedAt?: boolean;

    /**
     * Only retrieve games of gameServer
     */
    @ValidateIf(x => x.gameserverId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameserverId?: string;

    /**
     * Filter for games started after date
     */
    @ValidateIf(x => x.startedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedAfter?: Date;

    /**
     * Filter for games started before date
     */
    @ValidateIf(x => x.startedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedBefore?: Date;

      /**
     * Filter for games eneded after date
     */
    @ValidateIf(x => x.endedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedAfter?: Date;

    /**
     * Filter for games ended before date
     */
    @ValidateIf(x => x.endedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedBefore?: Date;

    /**
     * Filter for games on map
     */
    @ValidateIf(x => x.map !== undefined)
    @ValidateNested()
    @Field(() => ServerMapInput, {nullable: true})
    map?: ServerMapInput;

    /**
     * Filter for games with gameMode
     */
    @ValidateIf(x => x.gameMode !== undefined)
    @ValidateNested()
    @Field(() => GameModeInput, {nullable: true})
    gameMode?: GameModeInput;

    /**
     * Only include finished games
     */
    @ValidateIf(x => x.onlyFinishedGames !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    onlyFinishedGames?: boolean;

    /**
     * Only include matches which use a ranked matchConfig
     */
    @ValidateIf(x => x.rankedOnly !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    rankedOnly?: boolean;
}

/**
 * Input type used for game
 */
@InputType()
class GameInput
{
    /**
     * Id of game
     */
    @ValidateIf(x => x.id !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id?: string;

    /**
     * Gameserver id the game is played on
     */
    @ValidateIf(x => x.gameserverId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameserverId?: string;

    /**
     * Date game started at
     */
    @ValidateIf(x => x.startedAt !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedAt?: Date;

    /**
     * Date game ended at
     */
    @ValidateIf(x => x.endedAt !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedAt: Date;

    /**
     * Game being played on map
     */
    @ValidateIf(x => x.map !== undefined)
    @ValidateNested()
    @Field(() => ServerMapInput, {nullable: true})
    map?: ServerMapInput;

    /**
     * Game being played on gameMode
     */
    @ValidateIf(x => x.gameMode !== undefined)
    @ValidateNested()
    @Field(() => GameModeInput, {nullable: true})
    gameMode?: GameModeInput;
}

/**
 * Input type used for round
 */
@InputType()
class RoundInput
{
    /**
     * Id of round
     */
    @ValidateIf(x => x.id !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    id?: number;

    /**
     * Id of game the round belongs to
     */
    @ValidateIf(x => x.gameId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameId?: string;

    /**
     * Date round started at
     */
    @ValidateIf(x => x.startedAt !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedAt?: Date;

    /**
     * Date round ended at
     */
    @ValidateIf(x => x.endedAt !== undefined)
    @Field({nullable: true})
    @IsDate()
    endedAt: Date;

    /**
     * Score of special forces in round
     */
    @ValidateIf(x => x.scoreSpecialForces !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    scoreSpecialForces?: number;
    
    /**
     * Score of terrorists in round
     */
    @ValidateIf(x => x.scoreSpecialForces !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    scoreTerrorists?: number;
}

/**
 * Input type for player stats of round
 */
@InputType()
class PlayerRoundStatsInput
{
    /**
     * Id of round
     */
    @IsInt()
    @Field(() => Int)
    roundId!: number;

    /**
     * SteamId64 of player
     */
    @IsString()
    @Field(() => String)
    steamId64!: string;

    /**
     * Kills of player
     */
    @IsInt()
    @Field(() => Int)
    kills!: number;

    /**
     * Deaths of player
     */
    @IsInt()
    @Field(() => Int)
    deaths!: number;

    /**
     * Suicides of player
     */
    @IsInt()
    @Field(() => Int)
    suicides!: number;

    /**
     * Total damage of player
     */
    @IsNumber()
    @Field(() => Float)
    totalDamage!: number;

    /**
     * Score of player
     */
    @IsInt()
    @Field(() => Int)
    score!: number;

    /**
     * Team of player
     */
    @IsInt()
    @Field(() => Team)
    team!: Team;
}

/**
 * Input type for weapon
 */
@InputType()
class WeaponInput
{
    /**
     * Name of weapon
     */
    @IsString()
    @Field(() => String)
    name!: string;

    /**
     * Weapon type of weapon
     */
    @ValidateIf(x => x.weaponType !== undefined)
    @IsString()
    @Field(() => WeaponType)
    weaponType?: WeaponType;
}

/**
 * Input type for player weapon stats of round 
 */
@InputType()
class PlayerRoundWeaponStatsInput
{
    /**
     * Id of round
     */
    @IsInt()
    @Field(() => Int)
    roundId!: number;

    /**
     * SteamId64 of player
     */
    @IsString()
    @Field(() => String)
    steamId64!: string;

    /**
     * Weapon of player
     */
    @ValidateNested()
    @Field(() => WeaponInput)
    weapon!: WeaponInput;

    /**
     * Total damage of weapon
     */
    @IsNumber()
    @Field(() => Float)
    totalDamage!: number;

    /**
     * Shots fired on head
     */
    @IsInt()
    @Field(() => Int)
    shotsHead!: number;

    /**
     * Shots fired on chest
     */
    @IsInt()
    @Field(() => Int)
    shotsChest!: number;

    /**
     * Shots fired on legs
     */
    @IsInt()
    @Field(() => Int)
    shotsLegs!: number;

    /**
     * Shots fired on arms
     */
    @IsInt()
    @Field(() => Int)
    shotsArms!: number;

    /**
     * Total shots fired
     */
    @IsInt()
    @Field(() => Int)
    shotsFired!: number;

}

/**
 * Input type of round query
 */
@InputType()
class RoundQuery
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
     * Should be ordered descending?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;

    /**
     * Query for round of game
     */
    @ValidateIf(x => x.gameId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameId?: string;

    /**
     * Rounds should be started after
     */
    @ValidateIf(x => x.startedAfter !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedAfter?: Date;

    /**
     * Rounds should be started before
     */
    @ValidateIf(x => x.startedBefore !== undefined)
    @Field({nullable: true})
    @IsDate()
    startedBefore?: Date;

     /**
     * Filter for only finished rounds
     */
    @ValidateIf(x => x.onlyFinishedRounds !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    onlyFinishedRounds?: boolean;
}

/**
 * Input type for player round stats query
 */
@InputType()
class PlayerRoundStatsQuery
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
     * Of round
     */
    @IsInt()
    @Field(() => Int)
    roundId!: number;
}

/**
 * Input type for player round weapon stats query
 */
@InputType()
class PlayerRoundWeaponStatsQuery
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
     * Of round
     */
    @ValidateIf(x => x.roundId !== undefined)
    @IsString()
    @Field(() => Int, {nullable: true})
    roundId?: number;
}

/**
 * Wrapper type used for pagination of games
 */
@ObjectType()
class PaginatedGame extends Paginated(Game) {}

/**
 * Wrapper type used for pagination of gameModes
 */
@ObjectType()
class PaginatedGameMode extends Paginated(GameMode) {}

/**
 * Wrapper type used for pagination of player round stats
 */
@ObjectType()
class PaginatedPlayerRoundStats extends Paginated(PlayerRoundStats) {}

/**
 * Wrapper type used for pagination of player round weapon statistics
 */
@ObjectType()
class PaginatedPlayerRoundWeaponStats extends Paginated(PlayerRoundWeaponStats) {}

/**
 * Wrapper type used for pagination of rounds
 */
@ObjectType()
class PaginatedRound extends Paginated(Round) {}

/**
 * Resolver for games
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => Game)
export class GameResolver {
    
    constructor(private readonly statsService: GameStatisticsService)
    {
    }
       
    /**
     * Get games
     * @param options 
     */
    @MinRole(Role.none)
    @Query(() => PaginatedGame)
    @AllowTacByteAccess()
    async games(@Args({name: "options", type: () => GameQuery}) options: GameQuery): Promise<PaginatedGame>
    {
        const [games, count, pageCount] = await this.statsService.getGames({
            map: options.map ? new ServerMap({name: options.map.name}) : undefined,
            gameMode: options.gameMode ? new GameMode({name: options.gameMode.name}) : undefined,
            startedBefore: options.startedAfter,
            startedAfter: options.startedAfter,
            gameserver: options.gameserverId ? new Gameserver({id: options.gameserverId}) : undefined,
            orderByEndedAt: options.orderByEndedAt,
            orderDesc: options.orderDesc,
            page: options.page,
            pageSize: options.pageSize,
            ranked: options.rankedOnly,
            onlyFinishedGames: options.onlyFinishedGames
        });
        
        return { content: games, totalCount: count , pageCount: pageCount};
    }

    /**
     * Get game
     * @param gameId 
     */
    @MinRole(Role.none)
    @Query(() => Game, {nullable: true})
    @AllowTacByteAccess()
    async game(@Args("gameId") gameId: string)
    {
        return await this.statsService.getGame(gameId);
    }

    /**
     * Resolve rounds of game
     * @param game 
     */
    @ResolveField("rounds", returns => [Round])
    @AllowTacByteAccess()
    async rounds(@Parent() game: Game,) 
    {
        return await this.statsService.getRounds({game: game});
    }

    /**
     * Delete games
     * @param games
     */
    @Mutation(() => Boolean)
    async deleteGames(@Args({name: "gameInputs", type: () => [GameInput]}) gameInputs: GameInput[])
    {
        await this.statsService.deleteGames(gameInputs.map(x => ({id: x.id})));
        return true;
    }

    /**
     * Create or update game
     * @param gameserver 
     * @param gameInput 
     */
    @Mutation(() => Game, {description: "X-Request-ID must be set in header"})
    @UseInterceptors(TransactionInterceptor)
    async createUpdateGame(@RequestingGameserver() gameserver: Gameserver, @Args({name: "gameInput", type: () => GameInput}) gameInput: GameInput)
    {
        if(!gameserver)
        {
            if(!gameInput.gameserverId)
            {
                throw new HttpException("Could not resolve gameserver", HttpStatus.BAD_REQUEST);
            }

            gameserver = new Gameserver({id: gameInput.gameserverId})
        }

        const nuGame = new Game(
            {
                id: gameInput.id, 
                map: gameInput.map ? new ServerMap({name: gameInput.map.name}) : undefined,
                gameMode: gameInput.gameMode ? new GameMode({name: gameInput.gameMode.name, isTeamBased: gameInput.gameMode.isTeamBased}) : undefined,
                startedAt: gameInput.startedAt,
                endedAt: gameInput.endedAt,
                gameserver: gameserver
            });

        const ret = await this.statsService.createUpdateGame(nuGame);
        return ret;
    }    
}

/**
 * Resolver of rounds
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => Round)
export class RoundResolver {
    
    constructor(private readonly statsService: GameStatisticsService)
    {
    }
       
    /**
     * Get rounds
     * @param options 
     */
    @MinRole(Role.none)
    @Query(() => PaginatedRound)
    @AllowTacByteAccess()
    async rounds(@Args({name: "options", type: () => RoundQuery}) options: RoundQuery): Promise<PaginatedRound>
    {
        const [rounds, count, pageCount] = await this.statsService.getRounds({
            startedBefore: options.startedAfter,
            startedAfter: options.startedAfter,
            game: options.gameId ? new Game({id: options.gameId}) : undefined,
            orderDesc: options.orderDesc,
            page: options.page,
            pageSize: options.pageSize,
            onlyFinishedRounds: options.onlyFinishedRounds
        });
        
        return { content: rounds, totalCount: count , pageCount: pageCount};
    }


     /**
     * Delete rounds
     * @param rounds
     */
    @Mutation(() => Boolean)
    async deleteRounds(@Args({name: "roundInputs", type: () => [RoundInput]}) roundInputs: RoundInput[])
    {
        await this.statsService.deleteRounds(roundInputs);
        return true;
    }


    /**
     * Get round
     * @param roundId 
     */
    @MinRole(Role.none)
    @Query(() => Round, {nullable: true})
    @AllowTacByteAccess()
    async round(@Args("roundId") roundId: number)
    {
        return await this.statsService.getRound(roundId);
    }

    /**
     * Resolve playerRoundStats of round
     * @param round 
     */
    @ResolveField("playerRoundStats", returns => [PlayerRoundStats], {nullable: true})
    @AllowTacByteAccess()
    async playerRoundStats(@Parent() round: Round,) 
    {
        return await this.statsService.getRoundStatistics({round: round, overridePageSize: true})
    }

    /**
     * Resolve playerRoundWeaponStats of round
     * @param round 
     */
    @ResolveField("playerRoundWeaponStats", returns => [PlayerRoundWeaponStats], {nullable: true})
    @AllowTacByteAccess()
    async playerRoundWeaponStats(@Parent() round: Round,) 
    {
        return await this.statsService.getRoundWeaponStatistics({round: round, overridePageSize: true})
    }

    /**
     * Create or update round
     * @param roundInput 
     */
    @Mutation(() => Round, {description: "X-Request-ID must be set in header"})
    @UseInterceptors(TransactionInterceptor)
    async createUpdateRound(@Args({name: "roundInput", type: () => RoundInput}) roundInput: RoundInput)
    {
        const nuRound = new Round(
            {
                id: roundInput.id, 
                game: roundInput.gameId ? new Game({id: roundInput.gameId}) : undefined,
                startedAt: roundInput.startedAt,
                endedAt: roundInput.endedAt,
                scoreSpecialForces: roundInput.scoreSpecialForces,
                scoreTerrorists: roundInput.scoreTerrorists
            });

        const ret = await this.statsService.createUpdateRound(nuRound);

        return ret;
    }    
}

/**
 * Resolver of gameMode
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => GameMode)
export class GameModeResolver {
    
    constructor(private readonly statsService: GameStatisticsService)
    {
    }
       
    /**
     * Get gameModes
     */
    @MinRole(Role.none)
    @Query(() => PaginatedGameMode)
    @AllowTacByteAccess()
    async gameModes(): Promise<PaginatedGameMode>
    {     
        const [found, count, pages] = await this.statsService.getGameModes({});
        return { content: found, totalCount: count , pageCount: pages};
    }
}

/**
 * Resolver of player round stats
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => PlayerRoundStats)
export class PlayerRoundStatsResolver {
    
    constructor(private readonly statsService: GameStatisticsService, private readonly steamUserService: SteamUserService)
    {
    }
       
    /**
     * Get player round stats
     * @param options 
     */
    @MinRole(Role.none)
    @Query(() => PaginatedPlayerRoundStats)
    @AllowTacByteAccess()
    async playerRoundStats(@Args({name: "options", type: () => PlayerRoundStatsQuery}) options: PlayerRoundStatsQuery): Promise<PaginatedPlayerRoundStats>
    {
        const [rounds, count, pageCount] = await this.statsService.getRoundStatistics({
            page: options.page,
            pageSize: options.pageSize,
            round: new Round({id: options.roundId})
        });
        
        return { content: rounds, totalCount: count , pageCount: pageCount};
    }

    /**
     * Field resolver of steamuser for round stats
     * @param stats 
     */
    @MinRole(Role.none)
    @AllowFieldResolversForAllRoles()
    @ResolveField("steamUser", returns => SteamUser, {nullable: true})
    @AllowTacByteAccess()
    async steamUser(@Parent() stats: PlayerRoundStats) 
    {
        const found = await this.steamUserService.getSteamUsers([stats.steamId64]);
        return found.length > 0 ? found[0] : null;
    }

    /**
     * Create or update player round stats
     * @param playerRoundStatsInput 
     */
    @Mutation(() => Boolean)
    async createUpdatePlayerRoundStats(@Args({name: "playerRoundStatsInput", type: () => [PlayerRoundStatsInput]}) playerRoundStatsInput: PlayerRoundStatsInput[])
    {
        const stats = playerRoundStatsInput.map(x => (new PlayerRoundStats(
            {
                steamId64: x.steamId64,
                round: new Round({id: x.roundId}),
                kills: x.kills,
                deaths: x.deaths,
                suicides: x.suicides,
                totalDamage: x.totalDamage,
                score: x.score,
                team: x.team
            })));

        await this.steamUserService.updateSteamUsers(stats.map(x => x.steamId64)); // Don't update when weapon stats are set, this should be enough since update round / weapon stats are usually used at the same time

        await this.statsService.createUpdatePlayerRoundStats(stats);

        return true;
    }    
}

/**
 * Resolver of player round weapon stats
 */
@UseInterceptors(PublicStatisticsInterceptor)
@Resolver(() => PlayerRoundWeaponStats)
export class PlayerRoundWeaponStatsResolver {
    
    constructor(private readonly statsService: GameStatisticsService, private readonly steamUserService: SteamUserService)
    {
    }
       
    /**
     * Get player round weapon stats
     * @param options 
     */
    @MinRole(Role.none)
    @Query(() => PaginatedPlayerRoundWeaponStats)
    @AllowTacByteAccess()
    async playerRoundWeaponStats(@Args({name: "options", type: () => PlayerRoundWeaponStatsQuery}) options: PlayerRoundWeaponStatsQuery)
    {
        const [rounds, count, pageCount] = await this.statsService.getRoundWeaponStatistics({
            page: options.page,
            pageSize: options.pageSize,
            round: new Round({id: options.roundId})
        });
        
        return { content: rounds, totalCount: count , pageCount: pageCount};
    }

    /**
     * Field resolver of steamuser for round weapon stats
     * @param stats 
     */
    @MinRole(Role.none)
    @AllowFieldResolversForAllRoles()
    @ResolveField("steamUser", returns => SteamUser, {nullable: true})
    @AllowTacByteAccess()
    async steamUser(@Parent() stats: PlayerRoundStats) 
    {
        const found = await this.steamUserService.getSteamUsers([stats.steamId64]);
        return found.length > 0 ? found[0] : null;
    }

    /**
     * Create or update player round weapon stats
     * @param playerRoundWeaponStatsInput 
     */
    @Mutation(() => Boolean)
    async createUpdatePlayerRoundWeaponStats(@Args({name: "playerRoundWeaponStatsInput", type: () => [PlayerRoundWeaponStatsInput]}) playerRoundWeaponStatsInput: PlayerRoundWeaponStatsInput[])
    {
        const stats = playerRoundWeaponStatsInput.map(x => (new PlayerRoundWeaponStats(
            {
                steamId64: x.steamId64,
                round: new Round({id: x.roundId}),
                weapon: new Weapon({name: x.weapon.name, weaponType: x.weapon.weaponType}),
                shotsHead: x.shotsHead,
                shotsArms: x.shotsArms,
                shotsChest: x.shotsChest,
                shotsLegs: x.shotsLegs,
                shotsFired: x.shotsFired,
                totalDamage: x.totalDamage,
            })));

        await this.statsService.createUpdatePlayerRoundWeaponStats(stats);
        return true;
    }    

}
