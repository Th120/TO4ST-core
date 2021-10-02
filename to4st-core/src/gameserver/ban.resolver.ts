import { Resolver, Query, Mutation, Args, InputType, Field, Int, ObjectType, Parent, ResolveField } from '@nestjs/graphql';
import { ValidationPipe, UsePipes, UseGuards, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ValidateIf, IsInt, IsString, IsBoolean, IsDate } from 'class-validator';


import { AuthGuard } from '../shared/auth.guard';
import { Gameserver } from './gameserver.entity';
import { Ban } from './ban.entity';
import { Paginated } from '../shared/paginated';
import { AuthRole, Role, MinRole, RequestingGameserver, AllowTacByteAccess, RequiredAuthPlayerRoles, AuthPlayerRole, roleToAuthLevel } from '../shared/auth.utils';
import { PublicBanCheckInterceptor } from '../shared/public-ban-check.interceptor';
import { SteamUser } from '../core/steam-user.entity';
import { SteamUserService } from '../core/steam-user.service';
import { BanService } from './ban.service';
import { TransactionInterceptor } from '../shared/transaction.interceptor';


/**
 * Wrapper type used for pagination of bans
 */
@ObjectType()
class PaginatedBan extends Paginated(Ban) {}

/**
 * Input type for ban query
 */
@InputType()
class BanQuery
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
     * SteamId of banned player
     */
    @ValidateIf(x => x.steamId64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    steamId64?: string;

    /**
     * SteamId of player who issued ban
     */
    @ValidateIf(x => x.bannedBySteamId64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    bannedBySteamId64?: string;

    /**
     * Id1 used to identify a player
     */
    @ValidateIf(x => x.id1 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id1?: string;

    /**
     * Id2 used to identify a player
     */
    @ValidateIf(x => x.id2 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id2?: string;

    /**
     * Should be ordered descending by startedAt?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;

    /**
     * Should be ordered by expiration date
     */
    @ValidateIf(x => x.orderByExpirationDate !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderByExpirationDate?: boolean;

    /**
     * Don't include expired bans
     */
    @ValidateIf(x => x.noExpiredBans !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    noExpiredBans?: boolean;
}

/**
 * Input type for ban check of a player
 */
@InputType()
class BanCheck
{
    /**
     * SteamId of player
     */
    @ValidateIf(x => x.steamId64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    steamId64?: string;

    /**
     * Id1 of player
     */
    @ValidateIf(x => x.id1 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id1?: string;

    /**
     * Id2 of player
     */
    @ValidateIf(x => x.id2 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id2?: string;

    /**
     * BanId
     */
    @ValidateIf(x => x.id !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    banId?: string;

    /**
     * Should also query banlist partners
     */
    @ValidateIf(x => x.checkBanlistPartners !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true, description: "Ignored if request does not include authentification."})
    checkBanlistPartners?: boolean;
}

/**
 * Input type for ban
 */
@InputType()
class BanInput
{
    /**
     * Id of ban
     */
    @ValidateIf(x => x.banId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    banId?: string;

    /**
     * Banned player steamId64
     */
    @ValidateIf(x => x.steamId64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    steamId64?: string;

    /**
     * Id1 of banned player
     */
    @ValidateIf(x => x.id1 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id1?: string;

    /**
     * Id2 of banned player
     */
    @ValidateIf(x => x.id2 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id2?: string;

    /**
     * SteamId64 player who issued ban
     */
    @ValidateIf(x => x.bannedById64 !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    bannedById64?: string;

    /**
     * Expiration date
     */
    @ValidateIf(x => x.expiredAt !== undefined)
    @Field({nullable: true})
    @IsDate()
    expiredAt?: Date;

    /**
     * Reason for ban
     */
    @ValidateIf(x => x.reason !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    reason?: string;

    /**
     * Id of gameserver the ban was issued on
     */
    @ValidateIf(x => x.serverId !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    gameserverId?: string;
}

/**
 * Resolver of ban
 */
@Resolver(() => Ban)
export class BanResolver {

    constructor(private readonly banService: BanService, private readonly steamUserService: SteamUserService,)
    {
    }
       
    /**
     * Get bans
     * @param options 
     */
    @Query(() => PaginatedBan)
    @AllowTacByteAccess()
    @RequiredAuthPlayerRoles([AuthPlayerRole.ban])
    async bans(@Args({name: "options", type: () => BanQuery}) options: BanQuery): Promise<PaginatedBan>
    {
        const [bans, count, pageCount] = await this.banService.getBans({
            steamId64: options.steamId64,
            bannedById64: options.bannedBySteamId64,
            id1: options.id1,
            id2: options.id2,
            noExpiredBans: options.noExpiredBans,
            orderByExpirationDate: options.orderByExpirationDate,
            orderDesc: options.orderDesc,
            page: options.page,
            pageSize: options.pageSize,
            search: options.search,

        });
        
        return new PaginatedBan({ content: bans, totalCount: count , pageCount: pageCount});
    }
    
    /**
     * Field resolver for steam user data of banned player
     * @param ban 
     */
    @ResolveField("bannedSteamUser", returns => SteamUser, {nullable: true})
    @AllowTacByteAccess()
    @RequiredAuthPlayerRoles([AuthPlayerRole.ban])
    async bannedSteamUser(@Parent() ban: Ban) 
    {
        const found = await this.steamUserService.getSteamUsers([ban.steamId64]);
        return found.length > 0 ? found[0] : null;
    }

    /**
     * Field resolver for steam user data of player who issued ban
     * @param ban 
     */
    @ResolveField("bannedBySteamUser", returns => SteamUser, {nullable: true})
    @AllowTacByteAccess()
    @RequiredAuthPlayerRoles([AuthPlayerRole.ban])
    async bannedBySteamUser(@Parent() ban: Ban) 
    {
        const found = await this.steamUserService.getSteamUsers([ban.bannedById64]);
        return found.length > 0 ? found[0] : null;
    }

    /**
     * Check a ban
     * @param role Role of the authority who issued ban check
     * @param banCheck 
     */
    @MinRole(Role.none)
    @UseInterceptors(PublicBanCheckInterceptor)
    @AllowTacByteAccess()
    @Query(() => Ban, {nullable: true})
    async banCheck(@AuthRole() role, @Args({name: "banCheck", type: () => BanCheck}) banCheck: BanCheck)
    {
        return await this.banService.getBan({id: banCheck.banId, steamId64: banCheck.steamId64, id1: banCheck.id1, id2: banCheck.id2, queryBanlistPartners: banCheck.checkBanlistPartners && roleToAuthLevel(role) >= roleToAuthLevel(Role.authKey)});
    }

    /**
     * Delete ban
     * @param banId 
     */
    @RequiredAuthPlayerRoles([AuthPlayerRole.ban])
    @Mutation(() => Boolean)
    async deleteBan(@Args("banId") banId: string)
    {
        await this.banService.deleteBan(banId);
        return true;
    }

    /**
     * Create or update ban
     * @param gameserver Gameserver the ban was created on
     * @param banInput 
     */
    @UseInterceptors(TransactionInterceptor)
    @RequiredAuthPlayerRoles([AuthPlayerRole.ban])
    @Mutation(() => Ban, {description: "X-Request-ID must be set in header"})
    async createUpdateBan(@RequestingGameserver() gameserver: Gameserver, @Args({name: "banInput", type: () => BanInput}) banInput: BanInput)
    {
        if(!gameserver)
        {
            if(!banInput.gameserverId)
            {
                throw new HttpException("Could not resolve gameserver", HttpStatus.BAD_REQUEST);
            }

            gameserver = new Gameserver({id: banInput.gameserverId})
        }

        const nuBan = new Ban({id: banInput.banId, steamId64: banInput.steamId64, bannedById64: banInput.bannedById64, expiredAt: banInput.expiredAt, reason: banInput.reason, gameserver: gameserver, id1: banInput.id1, id2: banInput.id2});

        const ret = await this.banService.createUpdateBan(nuBan);
        return ret;
    }
}

