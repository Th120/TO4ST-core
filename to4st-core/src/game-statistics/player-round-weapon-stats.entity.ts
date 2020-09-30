import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Weapon } from './weapon.entity';
import { Round } from './round.entity';
import { transformSteamId64AccountId } from '../shared/utils';


/**
 * PlayerRoundWeaponStats entity
 */
@ObjectType()
@Entity()
export class PlayerRoundWeaponStats {
    
    /**
     * SteamId of player
     */
    @Field(() => String)
    @Expose()
    @PrimaryColumn({type: "int", unsigned: true, transformer: transformSteamId64AccountId, comment: "Save SteamAccountId to avoid bigint weirdness"})
    steamId64: string;

    /**
     * Round
     */
    @Field(() => Round)
    @Expose()
    @ManyToOne(() => Round, {primary: true, onDelete: "CASCADE", nullable: false  })
    round: Round;

    /**
     * Weapon
     */
    @Field(() => Weapon)
    @Expose()
    @ManyToOne(() => Weapon, {primary: true, onDelete: "CASCADE", cascade: ["update"], nullable: false  })
    weapon: Weapon;

    /**
     * Total damage
     */
    @Field(() => Float)
    @Expose()
    @Column({type: "float", unsigned: true })
    totalDamage: number;

    /**
     * Total shots on head
     */
    @Field(() => Int)
    @Expose()
    @Column({type: "smallint", unsigned: true })
    shotsHead: number;

    /**
     * Total shots on chest
     */
    @Field(() => Int)
    @Expose()
    @Column({type: "smallint", unsigned: true })
    shotsChest: number;

    /**
     * Total shots on legs
     */
    @Field(() => Int)
    @Expose()
    @Column({type: "smallint", unsigned: true })
    shotsLegs: number;
  
    /**
     * Total shots on arms
     */
    @Field(() => Int)
    @Expose()
    @Column({type: "smallint", unsigned: true })
    shotsArms: number;

    /**
     * Total shots fired
     */
    @Field(() => Int)
    @Expose()
    @Column({type: "int", unsigned: true })
    shotsFired: number;
    
    constructor(partial: Partial<PlayerRoundWeaponStats>) {
        Object.assign(this, partial);
    }
}