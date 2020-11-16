import { Entity, PrimaryColumn, Column, ManyToOne, BeforeUpdate, BeforeInsert, Index } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Gameserver} from '../gameserver/gameserver.entity';
import { ServerMap } from './server-map.entity';
import { GameMode } from './game-mode.entity';
import { roundDate } from '../shared/utils';
import { MatchConfig } from '../gameserver/match-config.entity';


/**
 * Game entity
 */
@ObjectType()
@Entity()
export class Game {
    /**
     * Id of game, is uuid should be unique globally
     */
    @Field(() => String)
    @Expose()
    @PrimaryColumn()
    id: string;

    /**
     * Gameserver the game was played on
     */
    @Field(() => Gameserver)
    @Expose()
    @ManyToOne(() => Gameserver, { onDelete: "CASCADE", nullable: false })
    gameserver: Gameserver;

    /**
     * Match config used for game (optional)
     */
    @Field(() => MatchConfig)
    @Expose()
    @ManyToOne(() => MatchConfig, { onDelete: "SET NULL", nullable: true })
    matchConfig?: MatchConfig;

    /**
     * Game started at
     */
    @Field()
    @Expose()
    @Index("idx_gameStartedAt")
    @Column()
    startedAt: Date;

    /**
     * Game ended at
     */
    @Field({nullable: true})
    @Expose()
    @Index("idx_gameEndedAt")
    @Column({ nullable: true })
    endedAt: Date;

    /**
     * Map the game was played on
     */
    @Field(() => ServerMap)
    @Expose()
    @ManyToOne(() => ServerMap, {cascade: ["update"], onDelete: "CASCADE", nullable: false })
    map: ServerMap;

    /**
     * GameMode of the game
     */
    @Field(() => GameMode)
    @Expose()
    @Index("idx_gameGameMode")
    @ManyToOne(() => GameMode, {cascade: ["update"], onDelete: "CASCADE", nullable: false })
    gameMode: GameMode;

    /**
     * Remove ms
     */
    @BeforeUpdate()
    @BeforeInsert()
    roundDates(): void
    {
        if(this.startedAt)
        {
            this.startedAt = roundDate(this.startedAt); //maria db does not store ms
        }

        if(this.endedAt)
        {
            this.endedAt = roundDate(this.endedAt);
        }
    }

    constructor(partial: Partial<Game>) {
        Object.assign(this, partial);
        this.roundDates();
    }
}