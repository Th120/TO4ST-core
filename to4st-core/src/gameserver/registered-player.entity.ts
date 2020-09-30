import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import {transformSteamId64AccountId} from '../shared/utils'


/**
 * Entity for registered player
 */
@ObjectType()
@Entity()
export class RegisteredPlayer {
   
    /**
     * Id of registered player in database
     */
    @PrimaryGeneratedColumn({ type: "int", unsigned: true })
    id: number;

    /**
     * SteamId64 of player
     */
    @Expose()
    @Field(() => String, { nullable: true })
    @Index({unique: true})
    @Column({ type: "int", unsigned: true, transformer: transformSteamId64AccountId, comment: "Save SteamAccountId to avoid bigint weirdness"})
    steamId64: string;

    /**
     * Special role of player
     */
    @Expose()
    @Field(() => String, { nullable: true })
    @Column({default: ""})
    visibleRole: string;

    /**
     * Is root admin?
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    rootAdmin: boolean;

    /**
     * Player can kick
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    kick: boolean;

    /**
     * Player can ban
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    ban: boolean;

    /**
     * Player can temp kick ban
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    tempKickBan: boolean;

    /**
     * Player can mute
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    mute: boolean;

    /**
     * Player can make teams
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    makeTeams: boolean;

    /**
     * Player has access to reserved slots
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    reservedSlots: boolean;

    /**
     * Player can broadcast message on server
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    broadcastMessage: boolean;

    /**
     * Player has game control
     */
    @Expose()
    @Field(() => Boolean, { nullable: true })
    @Column({default: false})
    gameControl: boolean;

    constructor(partial: Partial<RegisteredPlayer>) {
        Object.assign(this, partial);
      }
}