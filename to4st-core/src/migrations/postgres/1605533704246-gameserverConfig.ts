import {MigrationInterface, QueryRunner} from "typeorm";

export class gameserverConfig1605533704246 implements MigrationInterface {
    name = 'gameserverConfig1605533704246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "match_config" ("id" SERIAL NOT NULL, "configName" character varying NOT NULL, "configHash" character varying NOT NULL, "matchEndLength" smallint NOT NULL, "warmUpLength" smallint NOT NULL, "friendlyFireScale" double precision NOT NULL, "mapLength" smallint NOT NULL, "roundLength" smallint NOT NULL, "preRoundLength" smallint NOT NULL, "roundEndLength" smallint NOT NULL, "roundLimit" smallint NOT NULL, "allowGhostcam" boolean NOT NULL, "playerVoteThreshold" double precision NOT NULL, "autoBalanceTeams" boolean NOT NULL, "playerVoteTeamOnly" boolean NOT NULL, "maxTeamDamage" double precision NOT NULL, "enablePlayerVote" boolean NOT NULL, "autoSwapTeams" boolean NOT NULL, "midGameBreakLength" smallint NOT NULL, "nadeRestriction" boolean NOT NULL, "globalVoicechat" boolean NOT NULL, "muteDeadToTeam" boolean NOT NULL, "ranked" boolean NOT NULL, "private" boolean NOT NULL, "gameModeId" integer NOT NULL, CONSTRAINT "UQ_fbbc00f440d3e086650663cfbc8" UNIQUE ("configName"), CONSTRAINT "PK_79e221a6f63af9d4a76bfa61759" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_ranked" ON "match_config" ("ranked") `);
        await queryRunner.query(`CREATE TABLE "gameserver_config" ("currentName" character varying NOT NULL, "voteLength" smallint NOT NULL, "gamePassword" character varying NOT NULL, "reservedSlots" smallint NOT NULL, "balanceClans" boolean NOT NULL, "allowSkipMapVote" boolean NOT NULL, "tempKickBanTime" smallint NOT NULL, "autoRecordReplay" boolean NOT NULL, "playerGameControl" boolean NOT NULL, "enableMapVote" boolean NOT NULL, "serverAdmins" character varying NOT NULL DEFAULT '', "serverDescription" character varying NOT NULL DEFAULT '', "website" character varying NOT NULL DEFAULT '', "contact" character varying NOT NULL DEFAULT '', "mapNoReplay" smallint NOT NULL, "enableVoicechat" boolean NOT NULL, "gameserverId" character varying NOT NULL, "currentMatchConfigId" integer NOT NULL, CONSTRAINT "REL_e81629bd2734cc6621e92a8897" UNIQUE ("gameserverId"), CONSTRAINT "PK_e81629bd2734cc6621e92a88971" PRIMARY KEY ("gameserverId"))`);
        await queryRunner.query(`ALTER TABLE "gameserver" ADD "gameserverConfigGameserver" character varying`);
        await queryRunner.query(`ALTER TABLE "gameserver" ADD CONSTRAINT "UQ_e1489f4b9c2a32ba0cdb3c70238" UNIQUE ("gameserverConfigGameserver")`);
        await queryRunner.query(`ALTER TABLE "game" ADD "matchConfigId" integer`);
        await queryRunner.query(`ALTER TABLE "match_config" ADD CONSTRAINT "FK_dd7663370fbf217ac794906fc4e" FOREIGN KEY ("gameModeId") REFERENCES "game_mode"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" ADD CONSTRAINT "FK_e81629bd2734cc6621e92a88971" FOREIGN KEY ("gameserverId") REFERENCES "gameserver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" ADD CONSTRAINT "FK_8ec518313d27aa5389db772a018" FOREIGN KEY ("currentMatchConfigId") REFERENCES "match_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gameserver" ADD CONSTRAINT "FK_e1489f4b9c2a32ba0cdb3c70238" FOREIGN KEY ("gameserverConfigGameserver") REFERENCES "gameserver_config"("gameserverId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_466fe0a5a0188102b3fd889052f" FOREIGN KEY ("matchConfigId") REFERENCES "match_config"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_466fe0a5a0188102b3fd889052f"`);
        await queryRunner.query(`ALTER TABLE "gameserver" DROP CONSTRAINT "FK_e1489f4b9c2a32ba0cdb3c70238"`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" DROP CONSTRAINT "FK_8ec518313d27aa5389db772a018"`);
        await queryRunner.query(`ALTER TABLE "gameserver_config" DROP CONSTRAINT "FK_e81629bd2734cc6621e92a88971"`);
        await queryRunner.query(`ALTER TABLE "match_config" DROP CONSTRAINT "FK_dd7663370fbf217ac794906fc4e"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "matchConfigId"`);
        await queryRunner.query(`ALTER TABLE "gameserver" DROP CONSTRAINT "UQ_e1489f4b9c2a32ba0cdb3c70238"`);
        await queryRunner.query(`ALTER TABLE "gameserver" DROP COLUMN "gameserverConfigGameserver"`);
        await queryRunner.query(`DROP TABLE "gameserver_config"`);
        await queryRunner.query(`DROP INDEX "idx_ranked"`);
        await queryRunner.query(`DROP TABLE "match_config"`);
    }

}
