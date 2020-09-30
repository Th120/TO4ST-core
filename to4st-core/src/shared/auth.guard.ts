import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';
  import * as jwt from 'jsonwebtoken';
  import { Reflector } from '@nestjs/core';
import { Role, roleToAuthLevel, AuthPlayerRole } from './auth.utils';
import { AppConfigService } from '../core/app-config.service';
import { GameserverService } from '../gameserver/gameserver.service';
import { AuthKeyService } from '../core/auth-key.service';
import { hashPassword } from './utils';

/**
 * Guard used to auth requests
 */
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly appConfigService: AppConfigService, private readonly gameserverService: GameserverService, private readonly authKeyService: AuthKeyService, ) {}

    /**
     * Check request for authorization
     * @param context 
     * @returns whether request has auth to reach handler
     */
    async canActivate(context: ExecutionContext): Promise<boolean> 
    {
        const ctx = GqlExecutionContext.create(context).getContext();
        
        const noAuth = !!this.reflector.get<boolean>("noAuth", context.getHandler());
        
        if(noAuth)
        {
            ctx.role = Role.authKey;
        }
        else
        {
            await this.processSetAuth(context);
        }

        this.handleAuthPlayerRoles(context, ctx);
        this.handleFieldResolvers(context, ctx);
        this.handleOnlyRole(context, ctx);
        this.handleMinRole(context, ctx);
        
        const minRole = this.reflector.get<Role>("minRole", context.getHandler());
        const allowsTacByte = this.reflector.get<boolean>("allowTacByteAccess", context.getHandler());

        return this.roleCanAccessApi(ctx.role) || this.fulfillsMinRole(ctx.role, minRole) || !!allowsTacByte && ctx.role === Role.tacbyte;
    }

    /**
     * Checks whether request fulfills MinRole decorator if existing on handler
     * @param context 
     * @param gqlContext 
     */
    private handleMinRole(context: any, gqlContext: any)
    {
        const minRole = this.reflector.get<Role>("minRole", context.getHandler());

        if(!!minRole && !this.fulfillsMinRole(gqlContext.role, minRole))
        {
            throw new HttpException(`Access for role <${gqlContext.role}> not permitted. At least <${minRole}> required`, HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Checks whether request fulfills OnlyRole decorator if existing on handler
     * @param context 
     * @param gqlContext 
     */
    private handleOnlyRole(context: any, gqlContext: any)
    {
        const onlyRole = this.reflector.get<Role>("onlyRole", context.getHandler());

        if(!!onlyRole && gqlContext.role !== onlyRole)
        {
            throw new HttpException(`Access for role <${gqlContext.role}> not permitted. Role <${onlyRole}> required`, HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Checks whether request field resolver restrictions apply on handler
     * @param context 
     * @param gqlContext 
     */
    private handleFieldResolvers(context: any, gqlContext: any)
    {
        const allowFieldResolversAllRoles = this.reflector.get<boolean>("allowFieldResolversAllRoles", context.getHandler());

        if(!allowFieldResolversAllRoles && this.isResolvingGraphQLField(context) && !this.roleCanUseFieldResolvers(gqlContext.role))
        {
            throw new HttpException("Field resolver only available for auth roles", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Checks whether request fulfills requirements set by AuthPlayerRole restrictions
     * @param context 
     * @param gqlContext 
     */
    private handleAuthPlayerRoles(context: any, gqlContext: any)
    {
        if(gqlContext?.role === Role.authPlayer)
        {
          const roles = this.reflector.get<AuthPlayerRole[]>("requiredAuthPlayerRoles", context.getHandler());
       
          if(!roles || roles.length === 0)
          {
            throw new HttpException(`No auth Player roles assigned to this resolver method`, HttpStatus.FORBIDDEN);
          }
    
          const authPlayerRoles: AuthPlayerRole[] = gqlContext.authPlayerRoles;
    
          if(!authPlayerRoles || authPlayerRoles.length === 0)
          {
            throw new HttpException(`No authPlayerRoles set in context`, HttpStatus.FORBIDDEN);
          }
      
          if(!roles.some(x => authPlayerRoles.find(y => y === AuthPlayerRole.rootAdmin || y === x)))
          {
            throw new HttpException(`Could not find any overlap in authRoles. Required: [${roles.join(", ")}]`, HttpStatus.FORBIDDEN);
          }
        }
    }

    /**
     * Does role have a higher auth level than minRole
     * @param role 
     * @param minRole 
     */
    private fulfillsMinRole(role: Role, minRole: Role): boolean
    {
        return !!minRole ? roleToAuthLevel(role) >= roleToAuthLevel(minRole) : false;
    }

    /**
     * Can role access the api?
     * @param role 
     */
    private roleCanAccessApi(role: Role): boolean
    {
        return roleToAuthLevel(role) > 1;
    }

    /**
     * Can role access field resolvers
     * @param role 
     */
    private roleCanUseFieldResolvers(role: Role): boolean
    {
        return roleToAuthLevel(role) > 0;
    }
  
    /**
     * Process auth data of context
     * @param context 
     */
    async processSetAuth(context: any): Promise<void> 
    {
        const ctx = GqlExecutionContext.create(context).getContext();
        ctx.role = Role.none;

        if(!ctx.headers?.authorization)
        {
            return;
        }

        const splitAuth: string[] = ctx.headers.authorization.split(" ");

        if (splitAuth.length < 2 || splitAuth[0].trim().length === 0 || splitAuth[1].trim().length === 0) 
        {
            throw new HttpException("Invalid authorization format", HttpStatus.UNAUTHORIZED);
        }  

        if(splitAuth[0] === "Bearer")
        {
            const config = await this.appConfigService.getAppConfig(true);
            try 
            {
                const decoded = await jwt.verify(splitAuth[1], config.secret) as any;             

                if(decoded?.role === Role.admin)
                {
                    ctx.role = Role.admin;
                }
                else if(decoded?.role === Role.authPlayer)
                {
                    const authPlayerRoles = decoded.authPlayerRoles as AuthPlayerRole[];
                    ctx.role = Role.authPlayer;
                    ctx.authPlayerRoles = authPlayerRoles;

                    if(authPlayerRoles.find(x => x === AuthPlayerRole.rootAdmin))
                    {
                        ctx.role = Role.admin;
                    }
                } 
            } 
            catch (err) 
            {
                const error = "jwt error: " + (err.message || err.name);
                throw new HttpException(error, HttpStatus.UNAUTHORIZED);
            }
        }
        else if (splitAuth[0] === "AuthKey")
        {
            const authKey = await this.authKeyService.getAuthKey({authKey: splitAuth[1]})

            if(authKey)
            {
                authKey.lastUse = new Date();
                this.authKeyService.createUpdateAuthKey(authKey).catch(e => Logger.error("Update last use authKey failed"));
                ctx.authKey = authKey;
                ctx.role = Role.authKey;
            }
        }
        else if (splitAuth[0] === "Gameserver")
        {
            const gameserver = await this.gameserverService.getGameserver({authKey: splitAuth[1]});

            if(gameserver)
            {
                gameserver.lastContact = new Date();
                this.gameserverService.createUpdateGameserver(gameserver).catch(e => Logger.error("Update last contact gameserver failed"));
                ctx.gameserver = gameserver;
                ctx.role = Role.authKey;
            }
        }
        else if (splitAuth[0] === "Master")
        {
            const config = await this.appConfigService.getAppConfig(true);

            if(config?.masterserverKey)
            {
                const hashedMasterKey = hashPassword(config.masterserverKey);
                ctx.role = hashedMasterKey === splitAuth[1] ? Role.tacbyte : Role.none;
            }
        }
    }

    /**
     * Is currently resolving a graphQL field
     * @param context 
     */
    private isResolvingGraphQLField(context: ExecutionContext): boolean 
    {
        if (context.getType<GqlContextType>() === 'graphql') {
        const gqlContext = GqlExecutionContext.create(context);
        const info = gqlContext.getInfo();
        const parentType = info.parentType.name;
        return parentType !== 'Query' && parentType !== 'Mutation';
        }
        return false;
    }
  }