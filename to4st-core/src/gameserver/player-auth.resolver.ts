import { Resolver, Mutation, Args, } from '@nestjs/graphql';

import { PlayerAuthService } from './player-auth.service';

/**
 * Resolver for tokens that include an authPlayerRole 
 */
@Resolver()
export class PlayerAuthResolver {
    constructor(private readonly playerAuthService: PlayerAuthService)
    {
    }

    /**
     * Retrieve token for an authed player who is using the API from the game
     * @param steamId64 
     */
    @Mutation(() => String)
    async authPlayerToken(@Args("steamId64") steamId64: string): Promise<string>
    {
        return await this.playerAuthService.generateAuthPlayerToken(steamId64);
    }
}

