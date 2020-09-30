import { ConfigService } from '@nestjs/config';
import { Module, Global, } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { AuthKey } from './auth-key.entity';
import { AppConfig } from './app-config.entity';
import { SteamUserService } from './steam-user.service';
import { GameStatisticsService } from '../game-statistics/game-statistics.service';
import { GameserverService } from '../gameserver/gameserver.service';
import { Round } from '../game-statistics/round.entity';
import { Game } from '../game-statistics/game.entity';
import { GameMode } from '../game-statistics/game-mode.entity';
import { Gameserver } from '../gameserver/gameserver.entity';
import { Weapon } from '../game-statistics/weapon.entity';
import { ServerMap } from '../game-statistics/server-map.entity';
import { PlayerRoundStats } from '../game-statistics/player-round-stats.entity';
import { PlayerRoundWeaponStats } from '../game-statistics/player-round-weapon-stats.entity';
import { Ban } from '../gameserver/ban.entity';
import { RegisteredPlayer } from '../gameserver/registered-player.entity';
import { SteamUser } from './steam-user.entity';
import { AuthKeyResolver } from './auth-key.resolver';
import { AuthKeyService } from './auth-key.service';
import { MasterHeartbeatService } from './master-heartbeat.service';
import { LoginResolver } from './login.resolver';
import { LoginService } from './login.service';
import { TransactionIdService } from './transaction-id.service';
import { TransactionId } from './transaction-id.entity';
import { AppConfigResolver, } from './app-config.resolver';
import { AppConfigService } from './app-config.service';

/**
 * AppCore module which includes the core features of the backend
 */
@Global()
@Module({
  imports: [ TypeOrmModule.forFeature([AuthKey, AppConfig, Game, Round, GameMode, SteamUser, Gameserver, Weapon, ServerMap, PlayerRoundStats, PlayerRoundWeaponStats, Ban, RegisteredPlayer, TransactionId])],
  providers: [ AppConfigResolver, AuthKeyResolver, AppConfigService, SteamUserService, ConfigService, GameStatisticsService, GameserverService, AuthKeyService, MasterHeartbeatService, LoginResolver, LoginService, TransactionIdService],
  exports: [ AppConfigService , SteamUserService, AuthKeyService, TransactionIdService]
})
export class AppCoreModule {}
