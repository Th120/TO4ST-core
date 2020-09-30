import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeUpdate, BeforeInsert, Index } from 'typeorm';
import { Int, ObjectType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Game } from './game.entity';
import { roundDate } from '../shared/utils';


/**
 * Entity of round
 */
@ObjectType()
@Entity()
export class Round {
    /**
     * Id of round
     */
    @Field(() => Int)
    @Expose()
    @PrimaryGeneratedColumn({type: "int", unsigned: true })
    id: number;

    /**
     * Round the game belongs to
     */
    @Field(() => Game)
    @Expose()
    @Index("idx_roundGame")
    @ManyToOne(() => Game, { onDelete: "CASCADE", nullable: false })
    game: Game;

    /**
     * Round started at date
     */
    @Field()
    @Expose()
    @Index("idx_roundStartedAt")
    @Column()
    startedAt: Date;

    /**
     * Round ended at date
     */
    @Field({nullable: true})
    @Expose()
    @Index("idx_roundEndedAt")
    @Column({ nullable: true })
    endedAt: Date;
    
    /**
     * Score special forces
     */
    @Field(() => Int)
    @Expose()
    @Column({ type: "smallint", default: 0, unsigned: true })
    scoreSpecialForces: number;

    /**
     * Score terrorists
     */
    @Field(() => Int)
    @Expose()
    @Column({type: "smallint", default: 0, unsigned: true })
    scoreTerrorists: number;

    /**
     * Remove ms
     */
    @BeforeUpdate()
    @BeforeInsert()
    roundDates(): void
    {
        if(this.startedAt)
        {
            this.startedAt = roundDate(this.startedAt);
        }

        if(this.endedAt)
        {
            this.endedAt = roundDate(this.endedAt); 
        }
    }

    constructor(partial: Partial<Round>) {
        Object.assign(this, partial);
        this.roundDates();
    }

}