
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {Expose, Exclude} from "class-transformer";


import { Role } from '../shared/auth.utils';
import { STEAM_API_KEY } from '../globals';

/**
 * Entity for AppConfiguration
 */
@Entity()
@ObjectType()
export class AppConfig {
  
  /**
   * InstanceId associated with the configuration
   */
  @PrimaryColumn()
  @Field(() => String, {nullable: true})
  @Expose({groups: [Role.admin]})
  instanceId?: string;

  /**
   * Does this backend offer public player statistics?
   */
  @Column()
  @Field(() => Boolean, {nullable: true})
  @Expose()
  @Column({default: false})
  publicStats?: boolean;

  /**
   * List of banlist partner backends (URLs), which are queried when a gameserver requests a player ban
   */
  @Field(() => [String], {nullable: true})
  @Expose({groups: [Role.admin]})
  @Column({type: "simple-array", default: ""})
  banlistPartners?: string[];

  /**
   * Can other backends contact this one to check for the ban-status of a certain player?
   */
  @Field(() => Boolean, {nullable: true})
  @Expose()
  @Column({default: false})
  publicBanQuery?: boolean;

  /**
   * MasterserverKey used to authenticate when sending hearbeat to masterserver (optional)
   */
  @Field(() => String, {nullable: true})
  @Expose({groups: [Role.admin]})
  @Column({default: ""})
  masterserverKey?: string;

  /**
   * Steam Web API Key used to query steam userdata (optional)
   */
  @Field(() => String, {nullable: true})
  @Expose({groups: [Role.admin]})
  @Column({default: STEAM_API_KEY})
  steamWebApiKey?: string;

  /**
   * Address sent to the masterserver in order to contact this backend (use it if you are behind a reverse proxy and / or use https)
   */
  @Field(() => String, {nullable: true})
  @Expose({groups: [Role.admin]})
  @Column({default: ""})
  ownAddress?: string;

  /**
   * How often is the playerStats cache recalculated (in min), 0 to disable
   */
  @Field(() => Int, {nullable: true})
  @Expose()
  @Column({default: 5, type: "smallint", unsigned: true})
  playerStatsCacheAge?: number;

  /**
   * How much total score points required to be visible in player stats
   */
  @Field(() => Int, {nullable: true})
  @Expose()
  @Column({default: 100, type: "int", unsigned: true})
  minScoreStats?: number;
  
  /**
   * Hashed and salted admin password
   */
  @Exclude()
  @Column()
  password?: string;

  /**
   * Admin password was at least set once in the web panel?
   */
  @Exclude()
  @Column({default: false})
  passwordInitialised?: boolean;

  /**
   * Secret used to validate JSON webtoken
   */
  @Exclude()
  @Column()
  secret?: string;
 
  constructor(partial: Partial<AppConfig>) {
    Object.assign(this, partial);
  }
}