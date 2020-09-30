import { Entity, Column, PrimaryColumn, Index, ManyToOne, BeforeUpdate, BeforeInsert, } from 'typeorm';
import { ObjectType, Field, } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Gameserver } from './gameserver.entity';
import { Role } from '../shared/auth.utils';
import {transformSteamId64AccountId, roundDate} from '../shared/utils'


/**
 * Ban entity
 */
@ObjectType()
@Entity()
export class Ban {

    constructor(partial: Partial<Ban>) {
        Object.assign(this, partial);
        this.roundDates();
    }

    /**
     * Id of ban, is uuid should be unique globally
     */
    @Field(() => String)
    @Expose()
    @PrimaryColumn()
    id?: string;

    /**
     * SteamId of banned player
     */
    @Field(() => String)
    @Expose()
    @Index("idx_steamId64")
    @Column({ type: "int", unsigned: true, transformer: transformSteamId64AccountId, comment: "Save SteamAccountId to avoid bigint weirdness"})
    steamId64?: string;

    /**
     * SteamId of player who issued ban, is 0 if issued by gameserver or administrator
     */
    @Field(() => String, {nullable: true})
    @Expose({groups: [Role.authKey, Role.admin]})
    @Index("idx_bannedById64")
    @Column({ type: "int", unsigned: true, transformer: transformSteamId64AccountId, comment: "Save SteamAccountId to avoid bigint weirdness"})
    bannedById64?: string;

    /**
     * Ban created at date
     */
    @Field()
    @Expose()
    @Index("idx_createdAt")
    @Column()
    createdAt?: Date;

    /**
     * Expiration date
     */
    @Field()
    @Expose()
    @Index("idx_expiredAt")
    @Column()
    expiredAt?: Date;

    /**
     * Reason for ban
     */
    @Field(() => String)
    @Expose()
    @Column({default: ""})
    reason?: string;

    /**
     * Gameserver the ban was issued on, can be null
     */
    @Field(() => Gameserver, { nullable: true })
    @Expose()
    @ManyToOne(() => Gameserver, { nullable: true, onDelete: "SET NULL" })
    gameserver?: Gameserver;

    /**
     * Id1 used to identify a player
     */
    @Field(() => String, { nullable: true })
    @Expose({groups: [Role.authKey, Role.admin]})
    @Index("idx_id1")
    @Column({default: ""})
    id1?: string;

    /**
     * Id2 used to identify a player
     */
    @Field(() => String, { nullable: true })
    @Expose({groups: [Role.authKey, Role.admin]})
    @Index("idx_id2")
    @Column({default: ""})
    id2?: string;

    /**
     * Remove ms
     */
    @BeforeUpdate()
    @BeforeInsert()  
    roundDates(): void
    {
        if(this.createdAt)
        {
            this.createdAt = roundDate(this.createdAt); //maria db does not store ms
        }

        if(this.expiredAt)
        {
            this.expiredAt = roundDate(this.expiredAt); 
        }
    }


}