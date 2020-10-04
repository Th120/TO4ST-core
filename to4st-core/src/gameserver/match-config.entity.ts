import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


/**
 * Entity for a match config
 */
@ObjectType()
@Entity()
export class MatchConfig {

  /**
   * Id config
   */
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  @Expose()
  id?: number;

  /**
   * Name which describes the config
   */
  @Field(() => String)
  @Column({unique: true})
  @Expose()
  configName?: string;

  /**
   * Hash to identify the config by its props
   */
  @Field(() => String)
  @Column()
  @Expose()
  configHash?: string;

  /**
   * Time the scoreboard is shown (etc) after a game is finished in s
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  matchendLength: number;

  /**
   * WarmUp length in s
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  warmUpLength: number;

  /**
   * Friendly fire in %
   */
  @Field(() => Float)
  @Expose()
  @Column({type: "float", unsigned: true })
  friendlyFireScale?: number;

  /**
   * Map length in min
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  mapLength?: number;

  /**
   * Round length in s
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  roundLength?: number;

  /**
   * Time before a round starts in s
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  preRoundLength?: number;

  /**
   * Time at the end of a round in s
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  roundEndLength?: number;

  /**
   * Round limit
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  roundLimit?: number;

  /**
   * Enable ghostcam
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  allowGhostcam?: boolean;

  /**
   * Min % of votes for a temp kick ban
   */
  @Field(() => Float)
  @Expose()
  @Column({type: "float", unsigned: true })
  playerVoteThreshold?: number;

  /**
   * Balance teams for even team number
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  autoBalanceTeams?: boolean;

  /**
   * All players or only players in the team can be voted
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  playerVoteTeamOnly?: boolean;

  /**
   * Team damage before temp kickban
   */
  @Field(() => Float)
  @Expose()
  @Column({type: "float", unsigned: true })
  maxTeamDamage?: number;

  /**
   * Enable player vote
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  enablePlayerVote?: boolean;

  /**
   * Auto swap teams after half of the rounds of the round limit are finished
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  autoSwapTeams?: boolean;

  /**
   * Additional delay after teams are swapped and the other half of a team based game starts
   */
  @Field(() => Int)
  @Expose()
  @Column({type: "smallint", unsigned: true })
  midGameBreakLength?: number;

  /**
   * Only allow buying one nade of each kind per round
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  nadeRestriction?: boolean;

  /**
   * Global voicechat on server
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  globalVoicechat?: boolean;

  /**
   * Mute voicechat of dead team members
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  muteDeadToTeam?: boolean;
  
  /**
   * Is a ranked match
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  @Index("idx_ranked")
  ranked?: boolean;

  /**
   * Is a private match (at least password protected or reserved slots only)
   */
  @Field(() => Boolean)
  @Column()
  @Expose()
  private?: boolean;


  constructor(partial: Partial<MatchConfig>) {
    Object.assign(this, partial);

  } 
}
