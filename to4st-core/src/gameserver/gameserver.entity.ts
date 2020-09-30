import { Entity, Column, Index, BeforeUpdate, BeforeInsert, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Role } from '../shared/auth.utils';
import { roundDate } from '../shared/utils';
import { GameserverConfig } from './gameserver-config.entity';


/**
 * Entity of gameserver
 */
@ObjectType()
@Entity()
export class Gameserver {

  /**
   * Id of gameserver, is uuid should be unique globally
   */
  @PrimaryColumn()
  @Field(() => String)
  @Expose()
  id?: string;

  /**
   * AuthKey used by gameserver to auth
   */
  @Field(() => String, {nullable: true})
  @Column()
  @Index({unique: true})
  @Expose({groups: [Role.admin]})
  authKey?: string;

  /**
   * Current name of gameserver
   */
  @Column({default: ""})
  @Field(() => String)
  @Expose()
  currentName?: string;

  /**
   * Description of gameserver
   */
  @Column({default: ""})
  @Field(() => String, {nullable: true})
  @Expose({groups: [Role.authKey, Role.admin]})
  description?: string;
  
  /**
   * Last date the gameserver communicated with backend
   */
  @Column()
  @Field({nullable: true})
  @Expose({groups: [Role.authKey, Role.admin]})
  lastContact?: Date;

  /**
   * Remove ms
   */
  @BeforeUpdate()
  @BeforeInsert()  
  roundDates(): void
  {
      if(this.lastContact)
      {
        this.lastContact = roundDate(this.lastContact); //maria db does not store ms
      }
  }

  constructor(partial: Partial<Gameserver>) {
    Object.assign(this, partial);
    this.roundDates();
  } 
}
