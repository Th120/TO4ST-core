import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameserverResolver } from './gameserver.resolver';
import { GameserverService } from './gameserver.service';
import { Gameserver } from './gameserver.entity';
import { Ban } from './ban.entity';
import { RegisteredPlayer } from './registered-player.entity';
import { AppConfig } from '../core/app-config.entity';
import { AuthKey } from '../core/auth-key.entity';
import { RegisteredPlayerService } from './registered-player.service';
import { BanService } from './ban.service';
import { RegisteredPlayerResolver } from './registered-player.resolver';
import { BanResolver } from './ban.resolver';
import { PlayerAuthService } from './player-auth.service';
import { PlayerAuthResolver } from './player-auth.resolver';

/**
 * Module for all gameserver related services
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthKey,
      AppConfig,
      Ban,
      Gameserver,
      RegisteredPlayer,
    ]),
  ],
  providers: [
    GameserverService,
    RegisteredPlayerResolver,
    BanResolver,
    GameserverResolver,
    RegisteredPlayerService,
    BanService,
    PlayerAuthService,
    PlayerAuthResolver
  ],
  exports: [GameserverService, RegisteredPlayerService, BanService],
})
export class GameserverModule {}

