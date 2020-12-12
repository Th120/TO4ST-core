import {MigrationInterface, QueryRunner} from "typeorm";

export class playerStatsCache1607713693238 implements MigrationInterface {
    name = 'playerStatsCache1607713693238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_config" ADD "playerStatsCacheAge" smallint NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE "app_config" ADD "minScoreStats" integer NOT NULL DEFAULT '100'`);
        await queryRunner.query(`COMMENT ON COLUMN "steam_user"."steamId64" IS 'Save SteamAccountId to avoid bigint weirdness'`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" DROP CONSTRAINT "FK_e81629bd2734cc6621e92a88971"`);
        await queryRunner.query(`ALTER TABLE "gameserver" DROP CONSTRAINT "FK_e1489f4b9c2a32ba0cdb3c70238"`);
        await queryRunner.query(`COMMENT ON COLUMN "gameserver_config"."gameserverId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" ADD CONSTRAINT "UQ_e81629bd2734cc6621e92a88971" UNIQUE ("gameserverId")`);
        await queryRunner.query(`COMMENT ON COLUMN "player_round_stats"."steamId64" IS 'Save SteamAccountId to avoid bigint weirdness'`);
        await queryRunner.query(`COMMENT ON COLUMN "player_round_stats"."team" IS '0 - NONE, 1 - SF, 2 - TERR'`);
        await queryRunner.query(`COMMENT ON COLUMN "player_round_weapon_stats"."steamId64" IS 'Save SteamAccountId to avoid bigint weirdness'`);
        await queryRunner.query(`COMMENT ON COLUMN "ban"."steamId64" IS 'Save SteamAccountId to avoid bigint weirdness'`);
        await queryRunner.query(`COMMENT ON COLUMN "ban"."bannedById64" IS 'Save SteamAccountId to avoid bigint weirdness'`);
        await queryRunner.query(`COMMENT ON COLUMN "registered_player"."steamId64" IS 'Save SteamAccountId to avoid bigint weirdness'`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" ADD CONSTRAINT "FK_e81629bd2734cc6621e92a88971" FOREIGN KEY ("gameserverId") REFERENCES "gameserver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gameserver" ADD CONSTRAINT "FK_e1489f4b9c2a32ba0cdb3c70238" FOREIGN KEY ("gameserverConfigGameserver") REFERENCES "gameserver_config"("gameserverId") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gameserver" DROP CONSTRAINT "FK_e1489f4b9c2a32ba0cdb3c70238"`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" DROP CONSTRAINT "FK_e81629bd2734cc6621e92a88971"`);
        await queryRunner.query(`COMMENT ON COLUMN "registered_player"."steamId64" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ban"."bannedById64" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ban"."steamId64" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "player_round_weapon_stats"."steamId64" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "player_round_stats"."team" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "player_round_stats"."steamId64" IS NULL`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" DROP CONSTRAINT "UQ_e81629bd2734cc6621e92a88971"`);
        await queryRunner.query(`COMMENT ON COLUMN "gameserver_config"."gameserverId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "gameserver" ADD CONSTRAINT "FK_e1489f4b9c2a32ba0cdb3c70238" FOREIGN KEY ("gameserverConfigGameserver") REFERENCES "gameserver_config"("gameserverId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" ADD CONSTRAINT "FK_e81629bd2734cc6621e92a88971" FOREIGN KEY ("gameserverId") REFERENCES "gameserver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`COMMENT ON COLUMN "steam_user"."steamId64" IS NULL`);
        await queryRunner.query(`ALTER TABLE "app_config" DROP COLUMN "minScoreStats"`);
        await queryRunner.query(`ALTER TABLE "app_config" DROP COLUMN "playerStatsCacheAge"`);
    }

}
