/* istanbul ignore file */
import { ObjectType, Field, Float, Int } from "@nestjs/graphql";
import { Expose } from "class-transformer";
import { Weapon } from "./weapon.entity";

/**
 * Object type of aggrgated playerWeaponStatistics
 */
@ObjectType()
export class PlayerWeaponStatistics {

    /**
     * SteamId of player
     */
    @Field(() => String)
    @Expose()
    steamId64: string;

    /**
     * Total damage
     */
    @Field(() => Float)
    @Expose()
    totalDamage: number;

    /**
     * Total shots
     */
    @Field(() => Int)
    @Expose()
    totalShots: number;

    /**
     * Total shots on chest
     */
    @Field(() => Int)
    @Expose()
    shotsChest: number;

    /**
     * Total shots on legs
     */
    @Field(() => Int)
    @Expose()
    shotsLegs: number;

    /**
     * Total shots on arms
     */
    @Field(() => Int)
    @Expose()
    shotsArms: number;

    /**
     * Total shots on head
     */
    @Field(() => Int)
    @Expose()
    shotsHead: number;

    /**
     * Weapon
     */
    @Field(() => Weapon)
    @Expose()
    weapon: Weapon;
    
}