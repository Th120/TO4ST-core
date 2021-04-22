import {MigrationInterface, QueryRunner} from "typeorm";

export class defaultAvatarUrls1619126551658 implements MigrationInterface {
    name = 'defaultAvatarUrls1619126551658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "steam_user" ALTER COLUMN "avatarBigUrl" SET DEFAULT 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_full.jpg'`);
        await queryRunner.query(`ALTER TABLE "steam_user" ALTER COLUMN "avatarMediumUrl" SET DEFAULT 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_medium.jpg'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "steam_user" ALTER COLUMN "avatarMediumUrl" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "steam_user" ALTER COLUMN "avatarBigUrl" SET DEFAULT ''`);
    }

}
