import {MigrationInterface, QueryRunner} from "typeorm";

export class defaultAvatarUrls1619126432993 implements MigrationInterface {
    name = 'defaultAvatarUrls1619126432993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `steam_user` CHANGE `avatarBigUrl` `avatarBigUrl` varchar(255) NOT NULL DEFAULT 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_full.jpg'");
        await queryRunner.query("ALTER TABLE `steam_user` CHANGE `avatarMediumUrl` `avatarMediumUrl` varchar(255) NOT NULL DEFAULT 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_medium.jpg'");
        await queryRunner.query("ALTER TABLE `steam_user` CHANGE `lastUpdate` `lastUpdate` datetime NULL");
        await queryRunner.query("ALTER TABLE `transaction_id` CHANGE `resultJSON` `resultJSON` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `gameserver` DROP FOREIGN KEY `FK_e1489f4b9c2a32ba0cdb3c70238`");
        await queryRunner.query("ALTER TABLE `gameserver` CHANGE `gameserverConfigGameserver` `gameserverConfigGameserver` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `game` DROP FOREIGN KEY `FK_466fe0a5a0188102b3fd889052f`");
        await queryRunner.query("ALTER TABLE `game` CHANGE `endedAt` `endedAt` datetime NULL");
        await queryRunner.query("ALTER TABLE `game` CHANGE `matchConfigId` `matchConfigId` int NULL");
        await queryRunner.query("ALTER TABLE `round` CHANGE `endedAt` `endedAt` datetime NULL");
        await queryRunner.query("ALTER TABLE `ban` DROP FOREIGN KEY `FK_ef6b973ab0ec13728e454d46dc3`");
        await queryRunner.query("ALTER TABLE `ban` CHANGE `gameserverId` `gameserverId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `gameserver` ADD CONSTRAINT `FK_e1489f4b9c2a32ba0cdb3c70238` FOREIGN KEY (`gameserverConfigGameserver`) REFERENCES `gameserver_config`(`gameserverId`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `game` ADD CONSTRAINT `FK_466fe0a5a0188102b3fd889052f` FOREIGN KEY (`matchConfigId`) REFERENCES `match_config`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ban` ADD CONSTRAINT `FK_ef6b973ab0ec13728e454d46dc3` FOREIGN KEY (`gameserverId`) REFERENCES `gameserver`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `ban` DROP FOREIGN KEY `FK_ef6b973ab0ec13728e454d46dc3`");
        await queryRunner.query("ALTER TABLE `game` DROP FOREIGN KEY `FK_466fe0a5a0188102b3fd889052f`");
        await queryRunner.query("ALTER TABLE `gameserver` DROP FOREIGN KEY `FK_e1489f4b9c2a32ba0cdb3c70238`");
        await queryRunner.query("ALTER TABLE `ban` CHANGE `gameserverId` `gameserverId` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `ban` ADD CONSTRAINT `FK_ef6b973ab0ec13728e454d46dc3` FOREIGN KEY (`gameserverId`) REFERENCES `gameserver`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `round` CHANGE `endedAt` `endedAt` datetime NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `game` CHANGE `matchConfigId` `matchConfigId` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `game` CHANGE `endedAt` `endedAt` datetime NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `game` ADD CONSTRAINT `FK_466fe0a5a0188102b3fd889052f` FOREIGN KEY (`matchConfigId`) REFERENCES `match_config`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `gameserver` CHANGE `gameserverConfigGameserver` `gameserverConfigGameserver` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `gameserver` ADD CONSTRAINT `FK_e1489f4b9c2a32ba0cdb3c70238` FOREIGN KEY (`gameserverConfigGameserver`) REFERENCES `gameserver_config`(`gameserverId`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `transaction_id` CHANGE `resultJSON` `resultJSON` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `steam_user` CHANGE `lastUpdate` `lastUpdate` datetime NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `steam_user` CHANGE `avatarMediumUrl` `avatarMediumUrl` varchar(255) NOT NULL DEFAULT ''''");
        await queryRunner.query("ALTER TABLE `steam_user` CHANGE `avatarBigUrl` `avatarBigUrl` varchar(255) NOT NULL DEFAULT ''''");
    }

}
