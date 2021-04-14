import { Entity, Column, PrimaryColumn, Index, BeforeUpdate, BeforeInsert } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { transformSteamId64AccountId, roundDate } from '../shared/utils';

/**
 * Default avatar image if unable to retrieve, full size
 */
 export const DEFAULT_AVATAR_FULL = "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_full.jpg";

 /**
  * Default avatar image if unable to retrieve, medium size
  */
 export const DEFAULT_AVATAR_MEDIUM = "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_medium.jpg";


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
  @Field(() => String,  {nullable: true})
  @Column({default: DEFAULT_AVATAR_FULL})
  avatarBigUrl: string;

  /**
   * Current medium avatar
  */
  @Expose()
  @Field(() => String, {nullable: true})
  @Column({default: DEFAULT_AVATAR_MEDIUM})
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