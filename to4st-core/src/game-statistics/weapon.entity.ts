import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import {registerEnumType, ObjectType, Field } from "@nestjs/graphql"
import { Expose } from 'class-transformer';

/**
 * Enum used to identify weapon type
 */
export enum WeaponType {
    NONE = "None",
    KNIFE = "Knife",
    PISTOL = "Pistol",
    SMG = "SMG",
    RIFLE = "Rifle",
    NADE = "Grenade",
    BOMB = "Bomb"
}

/**
 * Register enum in graphQL
 */
registerEnumType(WeaponType, {
    name: "WeaponType",
});


/**
 * Weapon entity
 */
@ObjectType()
@Entity()
export class Weapon {
    /**
     * id of Weapon
     */
    @PrimaryGeneratedColumn({ type: "int", unsigned: true })
    id: number;

    /**
     * Name of weapon
     */
    @Field(() => String)
    @Expose()
    @Index({unique: true})
    @Column()
    name: string;

    /**
     * Weapon type of weapon
     */
    @Field(() => WeaponType)
    @Expose()
    @Column("varchar")
    weaponType: WeaponType;
    
    constructor(partial: Partial<Weapon>) {
        Object.assign(this, partial);
    }
}

