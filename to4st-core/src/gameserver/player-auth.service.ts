import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { Role, AuthPlayerRole } from '../shared/auth.utils';
import { AppConfigService } from '../core/app-config.service';
import { RegisteredPlayerService } from './registered-player.service';

/**
 * Service used for generating API tokens for authed Players
 */
@Injectable()
export class PlayerAuthService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly registeredPlayerService: RegisteredPlayerService,
  ) {}

  /**
   * Generate API Token for authed Player
   * @returns JSON Webtoken
   * @throws if player is not registered
   */
  async generateAuthPlayerToken(steamId64: string): Promise<string> {
    const player = await this.registeredPlayerService.getRegisteredPlayer({
      steamId64: steamId64.trim(),
    });

    if (!player) {
      throw new HttpException(
        `Could not find registered player by SteamId64: ${steamId64}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const authPlayerRoles: AuthPlayerRole[] = [];

    if (player.ban) {
      authPlayerRoles.push(AuthPlayerRole.ban);
    }

    if (player.rootAdmin) {
      authPlayerRoles.push(AuthPlayerRole.rootAdmin);
    }

    const appcfg = await this.appConfigService.getAppConfig(true);

    const token = jwt.sign(
      {
        role: Role.authPlayer,
        authPlayerRoles: authPlayerRoles,
      },
      appcfg.secret,
      {
        expiresIn: '2d',
      },
    );

    return token;
  }
}
