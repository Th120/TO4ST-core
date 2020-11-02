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
import { Game } from 'src/game-statistics/game.entity';
import { MatchConfig } from './match-config.entity';
import { GameserverConfig } from './gameserver-config.entity';
import { GameserverConfigService } from './gameserver-config.service';
import { GameserverConfigResolver, MatchConfigResolver } from './gameserver-config.resolver';
import { GameMode } from '../game-statistics/game-mode.entity';

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
      GameMode,
      RegisteredPlayer,
      Game,
      MatchConfig, 
      GameserverConfig
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
    PlayerAuthResolver,
    GameserverConfigService,
    MatchConfigResolver,
    GameserverConfigResolver
  ],
  exports: [GameserverService, RegisteredPlayerService, BanService, GameserverConfigService],
})
export class GameserverModule {}

