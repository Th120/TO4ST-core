import { Entity, Column, PrimaryGeneratedColumn, Index,  } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


/**
 * Entity of map
 */
@ObjectType()
@Entity()
export class ServerMap {

    /**
     * Id of map
     */
    @PrimaryGeneratedColumn({ type: "int", unsigned: true })
    id: number;

    /**
     * Name of map
     */
    @Field(() => String)
    @Expose()
    @Index({unique: true})
    @Column()
    name: string;

    constructor(partial: Partial<ServerMap>) {
        Object.assign(this, partial);
    }
}
// TODO extend with author, ideal playercount, images
