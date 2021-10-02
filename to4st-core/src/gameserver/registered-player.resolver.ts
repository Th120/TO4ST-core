import { Resolver, Query, Mutation, Args, InputType, Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { ValidationPipe, UsePipes, UseGuards,  } from '@nestjs/common';
import { ValidateIf, IsInt, IsString, IsBoolean,  } from 'class-validator';


import { AuthGuard } from '../shared/auth.guard';
import { RegisteredPlayer } from './registered-player.entity';
import { Paginated } from '../shared/paginated';
import { SteamUser } from '../core/steam-user.entity';
import { SteamUserService } from '../core/steam-user.service';
import { RegisteredPlayerService } from './registered-player.service';
import { RequiredAuthPlayerRoles, AuthPlayerRole } from '../shared/auth.utils';


/**
 * Input type for registered player query
 */
@InputType()
class RegisteredPlayersQuery
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
     * Search by steamId64
     */
    @ValidateIf(x => x.search !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    search?: string;
}

/**
 * Input type for registered player query
 */
@InputType()
class RegisteredPlayerQuery
{
    /**
     * Id of registered player
     */
    @ValidateIf(x => x.id !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    id?: number;

    /**
     * SteamId64 of registered player
     */
    @ValidateIf(x => x.steamId64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    steamId64?: string;
}

/**
 * Input type for registered player
 */
@InputType()
class RegisteredPlayerInput
{
    /**
     * SteamId64 of player
     */
    @IsString()
    @Field(() => String)
    steamId64: string;
 
    /**
     * Is root admin?
     */
    @ValidateIf(x => x.rootAdmin !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    rootAdmin?: boolean;

    /**
     * Special role of player
     */
    @ValidateIf(x => x.visibleRole !== undefined)
    @IsString()
    @Field(() => String, { nullable: true })
    visibleRole?: string;

    /**
     * Player can kick
     */
    @ValidateIf(x => x.kick !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    kick?: boolean;

    /**
     * Player can ban
     */
    @ValidateIf(x => x.ban !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    ban?: boolean;

    /**
     * Player can temp kick ban
     */
    @ValidateIf(x => x.tempKickBan !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    tempKickBan?: boolean;

    /**
     * Player can mute
     */
    @ValidateIf(x => x.mute !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    mute?: boolean;

    /**
     * Player can make teams
     */
    @ValidateIf(x => x.makeTeams !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    makeTeams?: boolean;

    /**
     * Player has access to reserved slots
     */
    @ValidateIf(x => x.reservedSlots !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    reservedSlots?: boolean;

    /**
     * Player can broadcast message on server
     */
    @ValidateIf(x => x.broadcastMessage !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    broadcastMessage?: boolean;

    /**
     * Player has game control
     */
    @ValidateIf(x => x.gameControl !== undefined)
    @IsBoolean()
    @Field(() => Boolean, { nullable: true })
    gameControl?: boolean;
}

/**
 * Wrapper type used for pagination of registered player
 */
@ObjectType()
class PaginatedRegisteredPlayers extends Paginated(RegisteredPlayer) {}

/**
 * Resolver of registered player
 */
@Resolver(() => RegisteredPlayer)
export class RegisteredPlayerResolver {

    constructor(private readonly registeredPlayerService: RegisteredPlayerService, private readonly steamUserService: SteamUserService,)
    {
    }

    /**
     * Get registered players
     * @param options 
     */
    @RequiredAuthPlayerRoles([AuthPlayerRole.rootAdmin])
    @Query(() => PaginatedRegisteredPlayers)
    async registeredPlayers(@Args({name: "options", type: () => RegisteredPlayersQuery}) options: RegisteredPlayersQuery): Promise<PaginatedRegisteredPlayers>
    {
        const [players, count, pageCount] = await this.registeredPlayerService.getRegisteredPlayers({
            page: options.page,
            pageSize: options.pageSize,
            search: options.search,
        });
        
        return new PaginatedRegisteredPlayers({ content: players, totalCount: count , pageCount: pageCount});
    }

    /**
     * Field resolver for steam user data
     * @param player 
     */
    @RequiredAuthPlayerRoles([AuthPlayerRole.rootAdmin])
    @ResolveField("steamUser", returns => SteamUser, {nullable: true})
    async steamUser(@Parent() player: RegisteredPlayer) 
    {
        const found = await this.steamUserService.getSteamUsers([player.steamId64]);
        return found.length > 0 ? found[0] : null;
    }

    /**
     * Get registered player
     * @param options 
     */
    @RequiredAuthPlayerRoles([AuthPlayerRole.rootAdmin])
    @Query(() => RegisteredPlayer, {nullable: true})
    async registeredPlayer(@Args({name: "options", type: () => RegisteredPlayerQuery}) options: RegisteredPlayerQuery)
    {
        return await this.registeredPlayerService.getRegisteredPlayer({id: options.id, steamId64: options.steamId64});
    }

    /**
     * Delete registered player
     * @param steamId64 
     */
    @RequiredAuthPlayerRoles([AuthPlayerRole.rootAdmin])
    @Mutation(() => Boolean)
    async deleteRegisteredPlayer(@Args("steamId64") steamId64: string)
    {
        await this.registeredPlayerService.deleteRegisteredPlayer({steamId64: steamId64});
        return true;
    }

    /**
     * Create or update registered player
     * @param registeredPlayer 
     */
    @RequiredAuthPlayerRoles([AuthPlayerRole.rootAdmin])
    @Mutation(() => RegisteredPlayer)
    async createUpdateRegisteredPlayer(@Args({name: "registeredPlayer", type: () => RegisteredPlayerInput}) registeredPlayer: RegisteredPlayerInput)
    {
        const nuPlayer = new RegisteredPlayer(
            {
                steamId64: registeredPlayer.steamId64, 
                rootAdmin: registeredPlayer.rootAdmin, 
                visibleRole: registeredPlayer.visibleRole,
                kick: registeredPlayer.kick, 
                ban: registeredPlayer.ban, 
                tempKickBan: registeredPlayer.tempKickBan, 
                mute: registeredPlayer.mute,
                broadcastMessage: registeredPlayer.broadcastMessage, 
                gameControl: registeredPlayer.gameControl,
                makeTeams: registeredPlayer.makeTeams,
                reservedSlots: registeredPlayer.reservedSlots
            });

        await this.steamUserService.updateSteamUsers([nuPlayer.steamId64]);

        const ret = await this.registeredPlayerService.createUpdateRegisteredPlayer(nuPlayer);
        return ret;
    }
}
