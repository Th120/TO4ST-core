import { Entity, Column, PrimaryColumn, Index, BeforeUpdate, BeforeInsert } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { transformSteamId64AccountId, roundDate } from '../shared/utils';


/**
 * Entity for steam user info in database
 */
@ObjectType()
@Entity()
export class SteamUser {
  
  /**
   * SteamId64 of player
   */
  @Expose()
  @Field(() => String)
  @PrimaryColumn({type: "int", unsigned: true, transformer: transformSteamId64AccountId, comment: "Save SteamAccountId to avoid bigint weirdness"})
  steamId64: string;

  /**
   * Current steam username
   */
  @Expose()
  @Field(() => String, {nullable: true})
  @Column({default: ""})
  @Index("idx_steamName")
  name: string;

  /**
   * Current big avatar
   */
  @Expose()
  @Field(() => String)
  @Column({default: ""})
  avatarBigUrl: string;

  /**
   * Current medium avatar
  */
  @Expose()
  @Field(() => String)
  @Column({default: ""})
  avatarMediumUrl: string;

  /**
   * Current state of user info in database 
   */
  @Column({nullable: true})
  lastUpdate: Date;

  /**
   * Remove ms
   */
  @BeforeUpdate()
  @BeforeInsert()
  roundDates(): void
  {
    if(this.lastUpdate)
    {
      this.lastUpdate = roundDate(this.lastUpdate); //maria db does not store ms
    }
  }

  constructor(partial: Partial<SteamUser>) {
    Object.assign(this, partial);
  }
}