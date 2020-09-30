import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { GameModeResolver, GameResolver, RoundResolver, PlayerRoundStatsResolver, PlayerRoundWeaponStatsResolver, } from './game-statistics.resolver';
import { GameStatisticsService } from './game-statistics.service';
import { GameMode } from './game-mode.entity';
import { Weapon } from './weapon.entity';
import { ServerMap } from './server-map.entity';
import { PlayerRoundStats } from './player-round-stats.entity';
import { PlayerRoundWeaponStats } from './player-round-weapon-stats.entity';
import { Game } from './game.entity';
import { Round } from './round.entity';
import { Gameserver } from '../gameserver/gameserver.entity';
import { AggregatedGameStatisticsService } from './aggregated-game-statistics.service';
import { PlayerStatisticsResolver, PlayerWeaponStatisticsResolver } from './aggregated-game-statistics.resolver';


/**
 * Module for everything related to statistics
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Game, Round, GameMode, Gameserver, Weapon, ServerMap, PlayerRoundStats, PlayerRoundWeaponStats,]),],
  providers: [GameResolver, GameStatisticsService, RoundResolver, GameModeResolver, PlayerRoundStatsResolver, PlayerRoundWeaponStatsResolver, PlayerStatisticsResolver, PlayerWeaponStatisticsResolver, AggregatedGameStatisticsService],
  exports: [GameStatisticsService, AggregatedGameStatisticsService]
})
export class GameStatisticsModule {}
