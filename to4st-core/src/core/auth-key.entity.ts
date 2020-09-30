
import { Entity, Column, PrimaryGeneratedColumn, Index, BeforeUpdate, BeforeInsert, } from 'typeorm';
import { Field, Int, ObjectType, } from '@nestjs/graphql';
import {Expose} from "class-transformer";


import { roundDate } from '../shared/utils';


/**
 * Entity for an AuthKey
 */
@Entity()
@ObjectType()
export class AuthKey {
  /**
   * Id which is used to identify an authKey
   */
  @PrimaryGeneratedColumn({unsigned: true})
  @Field(() => Int)
  @Expose()
  id: number;

  /**
   * AuthKey string itself
   */
  @Index({unique: true})
  @Column()
  @Field(() => String)
  @Expose()
  authKey: string;

  /**
   * Description of an authKey
  */
  @Column({default: ""})
  @Field(() => String)
  @Expose()
  description: string;

  /**
   * Last time an authKey was used for authorization
   */
  @Field()
  @Column()
  @Expose()
  lastUse: Date;

  /**
   * Removes ms from date
   */
  @BeforeUpdate()
  @BeforeInsert()
  roundDates(): void
  {
    if(this.lastUse)
    {
      this.lastUse = roundDate(this.lastUse); //maria db does not store ms
    }
  }

  constructor(partial: Partial<AuthKey>) {
    Object.assign(this, partial);
    this.roundDates();
  }
}