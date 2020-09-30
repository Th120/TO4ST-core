import { Resolver, Mutation, Args, Field, ObjectType, Query } from '@nestjs/graphql';
import { UsePipes, ValidationPipe, UseGuards,  } from '@nestjs/common';
import { Expose } from 'class-transformer';


import { AppConfigService, } from './app-config.service';
import { AppConfig } from './app-config.entity';
import { AuthGuard } from '../shared/auth.guard';
import { NoAuth, MinRole, Role, AuthRole, } from '../shared/auth.utils';
import { hashPassword } from '../shared/utils';
import { LoginService } from './login.service';


/**
 * Response for a successful login
 */
@ObjectType()
export class LoginResponse
{
    /**
     * Current app configuration
     */
    @Field(() => AppConfig)
    @Expose()
    appConfig: AppConfig;

    /**
     * JSON webtoken which can be used to authenticate as admin
     */
    @Field(() => String)
    @Expose()
    jwt: string;

    constructor(partial: Partial<LoginResponse>) 
    {
        Object.assign(this, partial);
    }
}

/**
 * Resolver for login
 */
@Resolver(() => LoginResponse)
export class LoginResolver {
    constructor(private readonly loginService: LoginService, private readonly appCfgService: AppConfigService, )
    {
    }

    /**
     * Login as admin
     * @param password Pre-hashed password from client 
     */
    @NoAuth()
    @Mutation(() => LoginResponse)
    async login(@Args("password") password: string): Promise<LoginResponse>
    {
        const token = await this.loginService.login(password);
        const appCfg = await this.appCfgService.getAppConfig(false);
            
        return { jwt: token, appConfig: appCfg };
    }

    /**
     * Checks whether request was sent with admin role
     * @param role Auth role of request
     */
    @MinRole(Role.none)
    @Query(() => Boolean)
    async authValid(@AuthRole() role: Role): Promise<boolean>
    {
        return role === Role.admin;
    }

    /**
     * Login as admin
     * @param password Non-hashed password (mostly used from GraphQL playground) 
     */
    @NoAuth()
    @Mutation(() => LoginResponse)
    async loginDev(@Args("password") password: string): Promise<LoginResponse>
    {
        const token = await this.loginService.login(hashPassword(password));
        const appCfg = await this.appCfgService.getAppConfig(false);
            
        return { jwt: token, appConfig: appCfg };
    }
}

