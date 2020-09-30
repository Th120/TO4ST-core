import { Entity, Column, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { Float, ObjectType, Field, Int } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Round } from './round.entity';
import { transformSteamId64AccountId, Team, transformTeam } from '../shared/utils';


/**
 * PlayerRoundStats entity
 */
@ObjectType()
@Entity()
export class PlayerRoundStats {

    /**
     * Round
     */
    @Field(() => Round)
    @Expose()
    @ManyToOne(() => Round, {primary: true, onDelete: "CASCADE", nullable: false  })
    round: Round;

    /**
     * SteamId of player
     */
    @Field(() => Int)
    @Expose()
    @Index("idx_steamId")
    @PrimaryColumn({type: "int", unsigned: true, transformer: transformSteamId64AccountId, comment: "Save SteamAccountId to avoid bigint weirdness"})
    steamId64: string;
 
    /**
     * Number of kills
     */
    @Field(() => Int)
    @Expose()
    @Column({ type: "smallint", unsigned: true, })
    kills: number;

    /**
     * Number of Deaths
     */
    @Field(() => Int)
    @Expose()
    @Column({ type: "smallint", unsigned: true, })
    deaths: number;

    /**
     * Number of suicides
     */
    @Field(() => Int)
    @Expose()
    @Column({ type: "smallint", unsigned: true})
    suicides: number;

    /**
     * Total damage
     */
    @Field(() => Float)
    @Expose()
    @Column({ type: "float", unsigned: true, })
    totalDamage: number;


    /**
     * Total score
     */
    @Field(() => Int)
    @Expose()
    @Column({ type: "smallint", unsigned: true, })
    score: number;

    /**
     * Team
     */
    @Field(() => Team)
    @Expose()
    @Column({ type: "smallint", transformer: transformTeam, comment: "0 - NONE, 1 - SF, 2 - TERR" })
    team: Team;

    constructor(partial: Partial<PlayerRoundStats>) {
        Object.assign(this, partial);
    }
}