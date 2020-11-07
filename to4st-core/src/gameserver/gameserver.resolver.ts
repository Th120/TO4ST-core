import { Resolver, Query, Mutation, Args, InputType, Field, Int, ObjectType, } from '@nestjs/graphql';
import { ValidateIf, IsInt, IsString, IsBoolean } from 'class-validator';
import { ValidationPipe, UsePipes, UseGuards, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';


import { GameserverConfigFilter, GameserverConfigOrder, GameserverService } from './gameserver.service';
import { AuthGuard } from '../shared/auth.guard';
import { Gameserver } from './gameserver.entity';
import { Paginated } from '../shared/paginated';
import { Role, AllowTacByteAccess, OnlyRole, RequestingGameserver } from '../shared/auth.utils';
import { TransactionInterceptor } from '../shared/transaction.interceptor';


/**
 * Input type for gameserver query
 */
@InputType()
class GameserversQuery
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
     * Should be ordered descending by last contact?
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;

    /**
     * Should be ordered by 
     */
    @ValidateIf(x => x.orderBy !== undefined)
    @IsString()
    @Field(() => GameserverConfigOrder, {nullable: true})
    orderBy?: GameserverConfigOrder;

    /**
     * Search by current name, authKey, description
     */
    @ValidateIf(x => x.search !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    search?: string;

    /**
     * Filter for configs
     */
    @ValidateIf(x => x.configFilter !== undefined)
    @IsString()
    @Field(() => GameserverConfigFilter, {nullable: true})
    configFilter?: GameserverConfigFilter;
}

/**
 * Wrapper type used for pagination of gameservers
 */
@ObjectType()
class PaginatedGameserver extends Paginated(Gameserver) {}

/**
 * Input type for gameserver
 */
@InputType()
class GameserverInput
{
    /**
     * Id of gameserver, is uuid should be unique globally
     */
    @ValidateIf(x => x.id !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id?: string;

    /**
     * AuthKey used by gameserver
     */
    @ValidateIf(x => x.authKey !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    authKey?: string;

    /**
     * Current name of gameserver
     */
    @ValidateIf(x => x.currentName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    currentName?: string;

    /**
     * Description of gameserver
     */
    @ValidateIf(x => x.description !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    description?: string;
}

/**
 * Input type for gameserverUpdate
 */
@InputType()
class GameserverUpdateInput
{
    /**
     * Current gameserver name
     */
    @ValidateIf(x => x.currentName !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    currentName?: string;
}

/**
 * Input type for gameserver query
 */
@InputType()
class GameserverQuery
{
    /**
     * Id of gameserver, is uuid should be unique globally
     */
    @ValidateIf(x => x.id !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    id?: string;

    /**
     * AuthKey used by gameserver
     */
    @ValidateIf(x => x.authKey !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    authKey?: string;
}

/**
 * Resolver of gameserver
 */
@Resolver(() => Gameserver)
export class GameserverResolver {

    constructor(private readonly gameserverService: GameserverService,)
    {
    }

    /**
     * Get gameservers
     * @param options 
     */
    @Query(() => PaginatedGameserver)
    @AllowTacByteAccess()
    async gameservers(@Args({name: "options", type: () => GameserversQuery}) options: GameserversQuery): Promise<PaginatedGameserver>
    {
        const [gameservers, count, pageCount] = await this.gameserverService.getGameservers({
            page: options.page,
            pageSize: options.pageSize,
            search: options.search,
            orderDesc: options.orderDesc,
            orderBy: options.orderBy,
            configFilter: options.configFilter
        });
       
        return { content: gameservers, totalCount: count , pageCount: pageCount};
    }

    /**
     * Get gameserver
     * @param options 
     */
    @Query(() => Gameserver)
    @AllowTacByteAccess()
    async gameserver(@Args({name: "options", type: () => GameserverQuery}) options: GameserverQuery)
    {
        return await this.gameserverService.getGameserver({authKey: options.authKey, id: options.id});
    }

    /**
     * Delete gameserver
     * @param gameserverId 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => Boolean)
    async deleteGameserver(@Args("gameserverId") gameserverId: string)
    {
        await this.gameserverService.deleteGameserver({id: gameserverId});
        return true;
    }

    /**
     * Create or update gameserver
     * @param gameserver 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => Gameserver, {description: "X-Request-ID must be set in header"})
    @UseInterceptors(TransactionInterceptor)
    async createUpdateGameserver(@Args({name: "gameserver", type: () => GameserverInput}) gameserver: GameserverInput)
    {
        const nuGameserver = new Gameserver({id: gameserver.id, authKey: gameserver.authKey, description: gameserver.description});
        const ret = await this.gameserverService.createUpdateGameserver(nuGameserver);
        return ret;
    }

    /**
     * Create or update gameserver
     * @param gameserver 
     */
    @Mutation(() => Gameserver, {description: "Only applies to gameserver key which is set for authorization"})
    async updateGameserver(@RequestingGameserver() gameserver: Gameserver, @Args({name: "gameserverUpdate", type: () => GameserverUpdateInput}) gameserverUpdate: GameserverUpdateInput)
    {
        if(!gameserver?.id)
        {
            throw new HttpException(`No gameserver set by auth guard`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const nuGameserver = new Gameserver({id: gameserver.id, currentName: gameserverUpdate.currentName});
        const ret = await this.gameserverService.createUpdateGameserver(nuGameserver);
        return ret;
    }

}

