import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn,} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


import { Role } from '../shared/auth.utils';
import { MatchConfig } from './match-config.entity';
import { Gameserver } from './gameserver.entity';


/**
 * Entity for a gameserver config
 */
@ObjectType()
@Entity()
export class GameserverConfig {

  /**
   * Id config
   */
  @OneToOne(() => Gameserver, {onDelete: "CASCADE", primary: true})
  @JoinColumn()
  @Field(() => Gameserver)
  @Expose()
  gameserver?: Gameserver;

  /**
   * Current default match config 
   */
  @ManyToOne(() => MatchConfig, {nullable: false})
  @JoinColumn()
  @Field(() => MatchConfig)
  @Expose()
  currentMatchConfig?: MatchConfig;


  /**
   * Current gameserver name
   */
  @Field(() => String)
  @Column()
  @Expose()
  currentName: string;

  /**
   * Map vote time if enabled
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  voteLength: number;

  /**
   * Private game / reserved slots password
   */
  @Field(() => String)
  @Column()
  @Expose({groups: [Role.admin, Role.authKey, Role.authPlayer]})
  gamePassword: string;

  /**
   * Number of reserved slots 
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  reservedSlots: number;

  /**
   * Balance players by clantag if using random join
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  balanceClans: boolean;

  /**
   * Players can vote to skip the map (seperated from player game control for more freedom)
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  allowSkipMapVote: boolean;

  /**
   * Time in min a player is banned
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  tempKickBanTime: number;

  /**
   * Record replay for every match (server side)
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  autoRecordReplay: boolean;

  /**
   * Players can vote to pause the game, reset to a different round or the match itself
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  playerGameControl: boolean;

  /**
   * Enable map vote after game 
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  enableMapVote: boolean;

  /**
   * List of server admins / owner to display
   */
  @Field(() => String)
  @Column({default: ""})
  @Expose()
  serverAdmins: string;

  /**
   * Server description
   */
  @Field(() => String)
  @Column({default: ""})
  @Expose()
  serverDescription: string;

  /**
   * Website which is associated with the server
   */
  @Field(() => String)
  @Column({default: ""})
  @Expose()
  website: string;

  /**
   * Contact information
   */
  @Field(() => String)
  @Column({default: ""})
  @Expose()
  contact: string;

  /**
   * Skip map for n games after being played
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  mapNoReplay: number;

  /**
   * Enable voicechat on gameserver
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  enableVoicechat: boolean;

  constructor(partial: Partial<GameserverConfig>) {
    Object.assign(this, partial);

  } 
}
