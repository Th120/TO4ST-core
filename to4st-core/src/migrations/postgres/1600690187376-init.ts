import {MigrationInterface, QueryRunner} from "typeorm";

export class init1600690187376 implements MigrationInterface {
    name = 'init1600690187376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_config" ("instanceId" character varying NOT NULL, "publicStats" boolean NOT NULL DEFAULT false, "banlistPartners" text NOT NULL DEFAULT '', "publicBanQuery" boolean NOT NULL DEFAULT false, "masterserverKey" character varying NOT NULL DEFAULT '', "steamWebApiKey" character varying NOT NULL DEFAULT '', "ownAddress" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL, "passwordInitialised" boolean NOT NULL DEFAULT false, "secret" character varying NOT NULL, CONSTRAINT "PK_93531067223f4258f0656887a99" PRIMARY KEY ("instanceId"))`);
        await queryRunner.query(`CREATE TABLE "auth_key" ("id" SERIAL NOT NULL, "authKey" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "lastUse" TIMESTAMP NOT NULL, CONSTRAINT "PK_8ec5be6c521f470516b474ed27f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5b602ae26284d163d16303d997" ON "auth_key" ("authKey") `);
        await queryRunner.query(`CREATE TABLE "steam_user" ("steamId64" integer NOT NULL, "name" character varying NOT NULL DEFAULT '', "avatarBigUrl" character varying NOT NULL DEFAULT '', "avatarMediumUrl" character varying NOT NULL DEFAULT '', "lastUpdate" TIMESTAMP, CONSTRAINT "PK_1d8fb183fbc02540687f54d56cd" PRIMARY KEY ("steamId64"))`);
        await queryRunner.query(`CREATE INDEX "idx_steamName" ON "steam_user" ("name") `);
        await queryRunner.query(`CREATE TABLE "transaction_id" ("transactionId" character varying NOT NULL, "insertedAt" TIMESTAMP NOT NULL, "resultJSON" character varying, CONSTRAINT "PK_02029489ef8ed5b72a2f30333da" PRIMARY KEY ("transactionId"))`);
        await queryRunner.query(`CREATE TABLE "game_mode" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "isTeamBased" boolean NOT NULL, CONSTRAINT "PK_ef9a2ad96f7bcea1655cd17e575" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_044d3c0ab088b8b1f604ac080a" ON "game_mode" ("name") `);
        await queryRunner.query(`CREATE TABLE "gameserver" ("id" character varying NOT NULL, "authKey" character varying NOT NULL, "currentName" character varying NOT NULL DEFAULT '', "description" character varying NOT NULL DEFAULT '', "lastContact" TIMESTAMP NOT NULL, CONSTRAINT "PK_dcea77a465013b9b07b3559f5e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b2c82e7f028dd0320e2cbae75c" ON "gameserver" ("authKey") `);
        await queryRunner.query(`CREATE TABLE "server_map" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8fed95d48a9fd8a084d54a1b829" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7f08167bb58d27be39ed2a4912" ON "server_map" ("name") `);
        await queryRunner.query(`CREATE TABLE "game" ("id" character varying NOT NULL, "startedAt" TIMESTAMP NOT NULL, "endedAt" TIMESTAMP, "gameserverId" character varying NOT NULL, "mapId" integer NOT NULL, "gameModeId" integer NOT NULL, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_gameStartedAt" ON "game" ("startedAt") `);
        await queryRunner.query(`CREATE INDEX "idx_gameEndedAt" ON "game" ("endedAt") `);
        await queryRunner.query(`CREATE INDEX "idx_gameGameMode" ON "game" ("gameModeId") `);
        await queryRunner.query(`CREATE TABLE "round" ("id" SERIAL NOT NULL, "startedAt" TIMESTAMP NOT NULL, "endedAt" TIMESTAMP, "scoreSpecialForces" smallint NOT NULL DEFAULT 0, "scoreTerrorists" smallint NOT NULL DEFAULT 0, "gameId" character varying NOT NULL, CONSTRAINT "PK_34bd959f3f4a90eb86e4ae24d2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_roundGame" ON "round" ("gameId") `);
        await queryRunner.query(`CREATE INDEX "idx_roundStartedAt" ON "round" ("startedAt") `);
        await queryRunner.query(`CREATE INDEX "idx_roundEndedAt" ON "round" ("endedAt") `);
        await queryRunner.query(`CREATE TABLE "player_round_stats" ("steamId64" integer NOT NULL, "kills" smallint NOT NULL, "deaths" smallint NOT NULL, "suicides" smallint NOT NULL, "totalDamage" double precision NOT NULL, "score" smallint NOT NULL, "team" smallint NOT NULL, "roundId" integer NOT NULL, CONSTRAINT "PK_6ec23b46ba0adc69a5cbba55bff" PRIMARY KEY ("steamId64", "roundId"))`);
        await queryRunner.query(`CREATE INDEX "idx_steamId" ON "player_round_stats" ("steamId64") `);
        await queryRunner.query(`CREATE TABLE "weapon" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "weaponType" character varying NOT NULL, CONSTRAINT "PK_41fe726bde6432339c1d4595d29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c0a6e6eabffa74c4a025ce2eec" ON "weapon" ("name") `);
        await queryRunner.query(`CREATE TABLE "player_round_weapon_stats" ("steamId64" integer NOT NULL, "totalDamage" double precision NOT NULL, "shotsHead" smallint NOT NULL, "shotsChest" smallint NOT NULL, "shotsLegs" smallint NOT NULL, "shotsArms" smallint NOT NULL, "shotsFired" integer NOT NULL, "roundId" integer NOT NULL, "weaponId" integer NOT NULL, CONSTRAINT "PK_a753dbcb5200d3ec391325fa935" PRIMARY KEY ("steamId64", "roundId", "weaponId"))`);
        await queryRunner.query(`CREATE TABLE "ban" ("id" character varying NOT NULL, "steamId64" integer NOT NULL, "bannedById64" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "expiredAt" TIMESTAMP NOT NULL, "reason" character varying NOT NULL DEFAULT '', "id1" character varying NOT NULL DEFAULT '', "id2" character varying NOT NULL DEFAULT '', "gameserverId" character varying, CONSTRAINT "PK_071cddb7d5f18439fd992490618" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_steamId64" ON "ban" ("steamId64") `);
        await queryRunner.query(`CREATE INDEX "idx_bannedById64" ON "ban" ("bannedById64") `);
        await queryRunner.query(`CREATE INDEX "idx_createdAt" ON "ban" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "idx_expiredAt" ON "ban" ("expiredAt") `);
        await queryRunner.query(`CREATE INDEX "idx_id1" ON "ban" ("id1") `);
        await queryRunner.query(`CREATE INDEX "idx_id2" ON "ban" ("id2") `);
        await queryRunner.query(`CREATE TABLE "registered_player" ("id" SERIAL NOT NULL, "steamId64" integer NOT NULL, "visibleRole" character varying NOT NULL DEFAULT '', "rootAdmin" boolean NOT NULL DEFAULT false, "kick" boolean NOT NULL DEFAULT false, "ban" boolean NOT NULL DEFAULT false, "tempKickBan" boolean NOT NULL DEFAULT false, "mute" boolean NOT NULL DEFAULT false, "makeTeams" boolean NOT NULL DEFAULT false, "reservedSlots" boolean NOT NULL DEFAULT false, "broadcastMessage" boolean NOT NULL DEFAULT false, "gameControl" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_bfa5b80fa473a169d838afc3a03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e8f1a1e6f7c3deff637482efa8" ON "registered_player" ("steamId64") `);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_2373cf05d5aec448112acc93b73" FOREIGN KEY ("gameserverId") REFERENCES "gameserver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_e4a9c8d911c2aaeba97e368202b" FOREIGN KEY ("mapId") REFERENCES "server_map"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_97c8d66b4d906bb743fb0d81b93" FOREIGN KEY ("gameModeId") REFERENCES "game_mode"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "round" ADD CONSTRAINT "FK_e4d9372889dee36f0a4be7f25e6" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_round_stats" ADD CONSTRAINT "FK_fe4b0797ce581679cd621c937ef" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_round_weapon_stats" ADD CONSTRAINT "FK_6960708d69a3780ee7d90cf8d8b" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_round_weapon_stats" ADD CONSTRAINT "FK_818dacb9a37b30976cae4157918" FOREIGN KEY ("weaponId") REFERENCES "weapon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ban" ADD CONSTRAINT "FK_ef6b973ab0ec13728e454d46dc3" FOREIGN KEY ("gameserverId") REFERENCES "gameserver"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ban" DROP CONSTRAINT "FK_ef6b973ab0ec13728e454d46dc3"`);
        await queryRunner.query(`ALTER TABLE "player_round_weapon_stats" DROP CONSTRAINT "FK_818dacb9a37b30976cae4157918"`);
        await queryRunner.query(`ALTER TABLE "player_round_weapon_stats" DROP CONSTRAINT "FK_6960708d69a3780ee7d90cf8d8b"`);
        await queryRunner.query(`ALTER TABLE "player_round_stats" DROP CONSTRAINT "FK_fe4b0797ce581679cd621c937ef"`);
        await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_e4d9372889dee36f0a4be7f25e6"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_97c8d66b4d906bb743fb0d81b93"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_e4a9c8d911c2aaeba97e368202b"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_2373cf05d5aec448112acc93b73"`);
        await queryRunner.query(`DROP INDEX "IDX_e8f1a1e6f7c3deff637482efa8"`);
        await queryRunner.query(`DROP TABLE "registered_player"`);
        await queryRunner.query(`DROP INDEX "idx_id2"`);
        await queryRunner.query(`DROP INDEX "idx_id1"`);
        await queryRunner.query(`DROP INDEX "idx_expiredAt"`);
        await queryRunner.query(`DROP INDEX "idx_createdAt"`);
        await queryRunner.query(`DROP INDEX "idx_bannedById64"`);
        await queryRunner.query(`DROP INDEX "idx_steamId64"`);
        await queryRunner.query(`DROP TABLE "ban"`);
        await queryRunner.query(`DROP TABLE "player_round_weapon_stats"`);
        await queryRunner.query(`DROP INDEX "IDX_c0a6e6eabffa74c4a025ce2eec"`);
        await queryRunner.query(`DROP TABLE "weapon"`);
        await queryRunner.query(`DROP INDEX "idx_steamId"`);
        await queryRunner.query(`DROP TABLE "player_round_stats"`);
        await queryRunner.query(`DROP INDEX "idx_roundEndedAt"`);
        await queryRunner.query(`DROP INDEX "idx_roundStartedAt"`);
        await queryRunner.query(`DROP INDEX "idx_roundGame"`);
        await queryRunner.query(`DROP TABLE "round"`);
        await queryRunner.query(`DROP INDEX "idx_gameGameMode"`);
        await queryRunner.query(`DROP INDEX "idx_gameEndedAt"`);
        await queryRunner.query(`DROP INDEX "idx_gameStartedAt"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP INDEX "IDX_7f08167bb58d27be39ed2a4912"`);
        await queryRunner.query(`DROP TABLE "server_map"`);
        await queryRunner.query(`DROP INDEX "IDX_b2c82e7f028dd0320e2cbae75c"`);
        await queryRunner.query(`DROP TABLE "gameserver"`);
        await queryRunner.query(`DROP INDEX "IDX_044d3c0ab088b8b1f604ac080a"`);
        await queryRunner.query(`DROP TABLE "game_mode"`);
        await queryRunner.query(`DROP TABLE "transaction_id"`);
        await queryRunner.query(`DROP INDEX "idx_steamName"`);
        await queryRunner.query(`DROP TABLE "steam_user"`);
        await queryRunner.query(`DROP INDEX "IDX_5b602ae26284d163d16303d997"`);
        await queryRunner.query(`DROP TABLE "auth_key"`);
        await queryRunner.query(`DROP TABLE "app_config"`);
    }

}
