import {MigrationInterface, QueryRunner} from "typeorm";

export class init1600690205704 implements MigrationInterface {
    name = 'init1600690205704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `app_config` (`instanceId` varchar(255) NOT NULL, `publicStats` tinyint NOT NULL DEFAULT 0, `banlistPartners` text NOT NULL DEFAULT '', `publicBanQuery` tinyint NOT NULL DEFAULT 0, `masterserverKey` varchar(255) NOT NULL DEFAULT '', `steamWebApiKey` varchar(255) NOT NULL DEFAULT '', `ownAddress` varchar(255) NOT NULL DEFAULT '', `password` varchar(255) NOT NULL, `passwordInitialised` tinyint NOT NULL DEFAULT 0, `secret` varchar(255) NOT NULL, PRIMARY KEY (`instanceId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `auth_key` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `authKey` varchar(255) NOT NULL, `description` varchar(255) NOT NULL DEFAULT '', `lastUse` datetime NOT NULL, UNIQUE INDEX `IDX_5b602ae26284d163d16303d997` (`authKey`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `steam_user` (`steamId64` int UNSIGNED NOT NULL COMMENT 'Save SteamAccountId to avoid bigint weirdness', `name` varchar(255) NOT NULL DEFAULT '', `avatarBigUrl` varchar(255) NOT NULL DEFAULT '', `avatarMediumUrl` varchar(255) NOT NULL DEFAULT '', `lastUpdate` datetime NULL, INDEX `idx_steamName` (`name`), PRIMARY KEY (`steamId64`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `transaction_id` (`transactionId` varchar(255) NOT NULL, `insertedAt` datetime NOT NULL, `resultJSON` varchar(255) NULL, PRIMARY KEY (`transactionId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `game_mode` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `isTeamBased` tinyint NOT NULL, UNIQUE INDEX `IDX_044d3c0ab088b8b1f604ac080a` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `gameserver` (`id` varchar(255) NOT NULL, `authKey` varchar(255) NOT NULL, `currentName` varchar(255) NOT NULL DEFAULT '', `description` varchar(255) NOT NULL DEFAULT '', `lastContact` datetime NOT NULL, UNIQUE INDEX `IDX_b2c82e7f028dd0320e2cbae75c` (`authKey`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `server_map` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_7f08167bb58d27be39ed2a4912` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `game` (`id` varchar(255) NOT NULL, `startedAt` datetime NOT NULL, `endedAt` datetime NULL, `gameserverId` varchar(255) NOT NULL, `mapId` int UNSIGNED NOT NULL, `gameModeId` int UNSIGNED NOT NULL, INDEX `idx_gameStartedAt` (`startedAt`), INDEX `idx_gameEndedAt` (`endedAt`), INDEX `idx_gameGameMode` (`gameModeId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `round` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `startedAt` datetime NOT NULL, `endedAt` datetime NULL, `scoreSpecialForces` smallint UNSIGNED NOT NULL DEFAULT 0, `scoreTerrorists` smallint UNSIGNED NOT NULL DEFAULT 0, `gameId` varchar(255) NOT NULL, INDEX `idx_roundGame` (`gameId`), INDEX `idx_roundStartedAt` (`startedAt`), INDEX `idx_roundEndedAt` (`endedAt`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `player_round_stats` (`steamId64` int UNSIGNED NOT NULL COMMENT 'Save SteamAccountId to avoid bigint weirdness', `kills` smallint UNSIGNED NOT NULL, `deaths` smallint UNSIGNED NOT NULL, `suicides` smallint UNSIGNED NOT NULL, `totalDamage` float UNSIGNED NOT NULL, `score` smallint UNSIGNED NOT NULL, `team` smallint NOT NULL COMMENT '0 - NONE, 1 - SF, 2 - TERR', `roundId` int UNSIGNED NOT NULL, INDEX `idx_steamId` (`steamId64`), PRIMARY KEY (`steamId64`, `roundId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `weapon` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `weaponType` varchar(255) NOT NULL, UNIQUE INDEX `IDX_c0a6e6eabffa74c4a025ce2eec` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `player_round_weapon_stats` (`steamId64` int UNSIGNED NOT NULL COMMENT 'Save SteamAccountId to avoid bigint weirdness', `totalDamage` float UNSIGNED NOT NULL, `shotsHead` smallint UNSIGNED NOT NULL, `shotsChest` smallint UNSIGNED NOT NULL, `shotsLegs` smallint UNSIGNED NOT NULL, `shotsArms` smallint UNSIGNED NOT NULL, `shotsFired` int UNSIGNED NOT NULL, `roundId` int UNSIGNED NOT NULL, `weaponId` int UNSIGNED NOT NULL, PRIMARY KEY (`steamId64`, `roundId`, `weaponId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `ban` (`id` varchar(255) NOT NULL, `steamId64` int UNSIGNED NOT NULL COMMENT 'Save SteamAccountId to avoid bigint weirdness', `bannedById64` int UNSIGNED NOT NULL COMMENT 'Save SteamAccountId to avoid bigint weirdness', `createdAt` datetime NOT NULL, `expiredAt` datetime NOT NULL, `reason` varchar(255) NOT NULL DEFAULT '', `id1` varchar(255) NOT NULL DEFAULT '', `id2` varchar(255) NOT NULL DEFAULT '', `gameserverId` varchar(255) NULL, INDEX `idx_steamId64` (`steamId64`), INDEX `idx_bannedById64` (`bannedById64`), INDEX `idx_createdAt` (`createdAt`), INDEX `idx_expiredAt` (`expiredAt`), INDEX `idx_id1` (`id1`), INDEX `idx_id2` (`id2`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `registered_player` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `steamId64` int UNSIGNED NOT NULL COMMENT 'Save SteamAccountId to avoid bigint weirdness', `visibleRole` varchar(255) NOT NULL DEFAULT '', `rootAdmin` tinyint NOT NULL DEFAULT 0, `kick` tinyint NOT NULL DEFAULT 0, `ban` tinyint NOT NULL DEFAULT 0, `tempKickBan` tinyint NOT NULL DEFAULT 0, `mute` tinyint NOT NULL DEFAULT 0, `makeTeams` tinyint NOT NULL DEFAULT 0, `reservedSlots` tinyint NOT NULL DEFAULT 0, `broadcastMessage` tinyint NOT NULL DEFAULT 0, `gameControl` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX `IDX_e8f1a1e6f7c3deff637482efa8` (`steamId64`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `game` ADD CONSTRAINT `FK_2373cf05d5aec448112acc93b73` FOREIGN KEY (`gameserverId`) REFERENCES `gameserver`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `game` ADD CONSTRAINT `FK_e4a9c8d911c2aaeba97e368202b` FOREIGN KEY (`mapId`) REFERENCES `server_map`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `game` ADD CONSTRAINT `FK_97c8d66b4d906bb743fb0d81b93` FOREIGN KEY (`gameModeId`) REFERENCES `game_mode`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `round` ADD CONSTRAINT `FK_e4d9372889dee36f0a4be7f25e6` FOREIGN KEY (`gameId`) REFERENCES `game`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `player_round_stats` ADD CONSTRAINT `FK_fe4b0797ce581679cd621c937ef` FOREIGN KEY (`roundId`) REFERENCES `round`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `player_round_weapon_stats` ADD CONSTRAINT `FK_6960708d69a3780ee7d90cf8d8b` FOREIGN KEY (`roundId`) REFERENCES `round`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `player_round_weapon_stats` ADD CONSTRAINT `FK_818dacb9a37b30976cae4157918` FOREIGN KEY (`weaponId`) REFERENCES `weapon`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ban` ADD CONSTRAINT `FK_ef6b973ab0ec13728e454d46dc3` FOREIGN KEY (`gameserverId`) REFERENCES `gameserver`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `ban` DROP FOREIGN KEY `FK_ef6b973ab0ec13728e454d46dc3`");
        await queryRunner.query("ALTER TABLE `player_round_weapon_stats` DROP FOREIGN KEY `FK_818dacb9a37b30976cae4157918`");
        await queryRunner.query("ALTER TABLE `player_round_weapon_stats` DROP FOREIGN KEY `FK_6960708d69a3780ee7d90cf8d8b`");
        await queryRunner.query("ALTER TABLE `player_round_stats` DROP FOREIGN KEY `FK_fe4b0797ce581679cd621c937ef`");
        await queryRunner.query("ALTER TABLE `round` DROP FOREIGN KEY `FK_e4d9372889dee36f0a4be7f25e6`");
        await queryRunner.query("ALTER TABLE `game` DROP FOREIGN KEY `FK_97c8d66b4d906bb743fb0d81b93`");
        await queryRunner.query("ALTER TABLE `game` DROP FOREIGN KEY `FK_e4a9c8d911c2aaeba97e368202b`");
        await queryRunner.query("ALTER TABLE `game` DROP FOREIGN KEY `FK_2373cf05d5aec448112acc93b73`");
        await queryRunner.query("DROP INDEX `IDX_e8f1a1e6f7c3deff637482efa8` ON `registered_player`");
        await queryRunner.query("DROP TABLE `registered_player`");
        await queryRunner.query("DROP INDEX `idx_id2` ON `ban`");
        await queryRunner.query("DROP INDEX `idx_id1` ON `ban`");
        await queryRunner.query("DROP INDEX `idx_expiredAt` ON `ban`");
        await queryRunner.query("DROP INDEX `idx_createdAt` ON `ban`");
        await queryRunner.query("DROP INDEX `idx_bannedById64` ON `ban`");
        await queryRunner.query("DROP INDEX `idx_steamId64` ON `ban`");
        await queryRunner.query("DROP TABLE `ban`");
        await queryRunner.query("DROP TABLE `player_round_weapon_stats`");
        await queryRunner.query("DROP INDEX `IDX_c0a6e6eabffa74c4a025ce2eec` ON `weapon`");
        await queryRunner.query("DROP TABLE `weapon`");
        await queryRunner.query("DROP INDEX `idx_steamId` ON `player_round_stats`");
        await queryRunner.query("DROP TABLE `player_round_stats`");
        await queryRunner.query("DROP INDEX `idx_roundEndedAt` ON `round`");
        await queryRunner.query("DROP INDEX `idx_roundStartedAt` ON `round`");
        await queryRunner.query("DROP INDEX `idx_roundGame` ON `round`");
        await queryRunner.query("DROP TABLE `round`");
        await queryRunner.query("DROP INDEX `idx_gameGameMode` ON `game`");
        await queryRunner.query("DROP INDEX `idx_gameEndedAt` ON `game`");
        await queryRunner.query("DROP INDEX `idx_gameStartedAt` ON `game`");
        await queryRunner.query("DROP TABLE `game`");
        await queryRunner.query("DROP INDEX `IDX_7f08167bb58d27be39ed2a4912` ON `server_map`");
        await queryRunner.query("DROP TABLE `server_map`");
        await queryRunner.query("DROP INDEX `IDX_b2c82e7f028dd0320e2cbae75c` ON `gameserver`");
        await queryRunner.query("DROP TABLE `gameserver`");
        await queryRunner.query("DROP INDEX `IDX_044d3c0ab088b8b1f604ac080a` ON `game_mode`");
        await queryRunner.query("DROP TABLE `game_mode`");
        await queryRunner.query("DROP TABLE `transaction_id`");
        await queryRunner.query("DROP INDEX `idx_steamName` ON `steam_user`");
        await queryRunner.query("DROP TABLE `steam_user`");
        await queryRunner.query("DROP INDEX `IDX_5b602ae26284d163d16303d997` ON `auth_key`");
        await queryRunner.query("DROP TABLE `auth_key`");
        await queryRunner.query("DROP TABLE `app_config`");
    }

}
