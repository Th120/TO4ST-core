import { Resolver, Query, Mutation, Args, InputType, Field, Int, ObjectType, } from '@nestjs/graphql';
import { UsePipes, ValidationPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { ValidateIf, IsString, IsInt, IsBoolean, } from 'class-validator';


import { AuthGuard } from '../shared/auth.guard';
import { Paginated } from '../shared/paginated';
import { AuthKeyService } from './auth-key.service';
import { TransactionInterceptor } from '../shared/transaction.interceptor';
import { OnlyRole, Role } from '../shared/auth.utils';
import { AuthKey } from './auth-key.entity';


/**
 * InputType for an authKey query
 */
@InputType()
class AuthKeyQuery
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
     * Search for partial of description or authKey string
     */
    @ValidateIf(x => x.search !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    search?: string;

    /**
     * Orders by lastUse of authKey
     */
    @ValidateIf(x => x.orderDesc !== undefined)
    @IsBoolean()
    @Field(() => Boolean, {nullable: true})
    orderDesc?: boolean;
}

@InputType()
class AuthKeyInput
{
    /**
     * Id used to identify authKey when updating
     */
    @ValidateIf(x => x.id !== undefined)
    @IsInt()
    @Field(() => Int, {nullable: true})
    id?: number;
  
    /**
     * AuthKey string itself
     */
    @ValidateIf(x => x.authKey !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    authKey?: string;
  
    /**
     * Description of an authKey
     */
    @ValidateIf(x => x.description !== undefined)
    @IsString()
    @Field(() => String, {nullable: true})
    description?: string;
}

/**
 * ObjectType for a paginated authKey response
 */
@ObjectType()
class PaginatedAuthKey extends Paginated(AuthKey) {}

/**
 * Resolver for authKey ObjectType
 */
@Resolver(() => AuthKey)
export class AuthKeyResolver {
    constructor(private readonly authKeyService: AuthKeyService,)
    {
    }

    /**
     * Query multiple authKeys
     * @param options 
     */
    @OnlyRole(Role.admin)
    @Query(() => PaginatedAuthKey)
    async authKeys(@Args({name: "options", type: () => AuthKeyQuery}) options: AuthKeyQuery): Promise<PaginatedAuthKey>
    {
        const [keys, count, pageCount] = await this.authKeyService.getAuthKeys({page: options?.page, pageSize: options?.pageSize, orderDesc: options?.orderDesc, search: options?.search});
        
        return new PaginatedAuthKey({ content: keys, totalCount: count, pageCount: pageCount });
    }
    
    /**
     * Get an authKey
     * @param authKey 
     */
    @OnlyRole(Role.admin)
    @Query(() => AuthKey, {nullable: true})
    async authKey(@Args("authKey") authKey: string)
    {
        return await this.authKeyService.getAuthKey({authKey: authKey});
    }

    /**
     * Delete an authKey
     * @param authKey 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => Boolean)
    async deleteAuthKey(@Args("authKey") authKey: string)
    {
        await this.authKeyService.deleteAuthKey({authKey: authKey});
        return true;
    }
    
    /**
     * Create or update (updates if authKey object has an id) an authKey
     * @param authKey 
     */
    @OnlyRole(Role.admin)
    @Mutation(() => AuthKey, {description: "X-Request-ID must be set in header"})
    @UseInterceptors(TransactionInterceptor)
    async createUpdateAuthKey(@Args({name: "authKey", type: () => AuthKeyInput}) authKey: AuthKeyInput)
    {
        const key = new AuthKey({id: authKey.id, authKey: authKey.authKey, description: authKey.description});
        const ret = await this.authKeyService.createUpdateAuthKey(key);
        return ret;
    }

}

