import { Entity, Column, PrimaryGeneratedColumn, Index,  } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

/**
 * GameMode entity
 */
@ObjectType()
@Entity()
export class GameMode {
    /**
     * Id of gameMode
     */
    @PrimaryGeneratedColumn({ type: "int", unsigned: true })
    id: number;

    /**
     * Name of gameMode
     */
    @Field(() => String)
    @Expose()
    @Index({unique: true})
    @Column()
    name: string;

    /**
     * GameMode is team based
     */
    @Field(() => Boolean)
    @Expose()
    @Column()
    isTeamBased: boolean;

    constructor(partial: Partial<GameMode>) {
        Object.assign(this, partial);
    }
}