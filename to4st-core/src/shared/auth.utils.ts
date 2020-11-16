import { createParamDecorator, SetMetadata, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Available authorization roles
 */
export enum Role {
    none = "none",
    authKey = "authKey",
    tacbyte = "tacbyte",
    admin = "admin",
    authPlayer = "authPlayer"
}

/**
 * Enum used for player roles 
 */
export enum AuthPlayerRole {
    rootAdmin = "rootAdmin",
    ban = "ban",
    gameControl = "gameControl"
  }

/**
 * Convert role to auth level used to compare auth roles
 * @param role 
 */
export function roleToAuthLevel(role: Role): number
{
    if(!role)
    {
        return 0;
    }

    switch (role) {
        case Role.tacbyte:
            return 1;
        case Role.authPlayer:
            return 2;
        case Role.authKey:
            return 3;
        case Role.admin:
            return 4;    
    }
    
    return 0;
}

/**
 * Requires a min role
 * @param role 
 */
export const MinRole = (role = Role.authKey,) => SetMetadata('minRole', role ?? Role.authKey); // generally used to distinguish between authed roles or none

/**
 * Requires specific role
 * @param role 
 */
export const OnlyRole = (role = Role.admin,) => SetMetadata('onlyRole', role ?? Role.admin); //always default to the most restrictive role

/**
 * Disable roles for method, auto assigns authKey
 */
export const NoAuth = () => SetMetadata('noAuth', true);

/**
 * Require
 */
export const RequiredAuthPlayerRoles = (authPlayerRoles: AuthPlayerRole[]) => SetMetadata('requiredAuthPlayerRoles', authPlayerRoles);

/**
 * Allows field resolver for all roles
 */
export const AllowFieldResolversForAllRoles = () => SetMetadata('allowFieldResolversAllRoles', true);

/**
 * Allow method to be accessed by TacByte / Masterserver
 */
export const AllowTacByteAccess = () => SetMetadata('allowTacByteAccess', true);

/**
 * Passes authRole of execution context
 */
export const AuthRole = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const context = GqlExecutionContext.create(ctx).getContext();
        return (context?.role ?? Role.none) as Role;
    });

/**
 * Passes gameserver of request
 */
export const RequestingGameserver = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const context = GqlExecutionContext.create(ctx).getContext();
        return context.gameserver;
    });

/**
 * Passes authKey of request
 */
export const RequestingAuthKey = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const context = GqlExecutionContext.create(ctx).getContext();
        return context.authKey;
    });