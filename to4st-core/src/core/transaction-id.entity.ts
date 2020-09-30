import { Entity,  PrimaryColumn, Column, BeforeUpdate, BeforeInsert } from 'typeorm';

import { roundDate } from '../shared/utils';

/**
 * Entity for a TransactionId
 */
@Entity()
export class TransactionId {
  
  /**
   * TransactionId string itself
   */
  @PrimaryColumn()
  transactionId?: string;

  /**
   * Time the transactionId was used
   */
  @Column()
  insertedAt?: Date;

  /**
   * Time the transactionId was used
   */
  @Column({nullable: true})
  resultJSON?: string;

  /**
   * Remove ms
   */
  @BeforeUpdate()
  @BeforeInsert()
  roundDates(): void
  {
    if(this.insertedAt)
    {
      this.insertedAt = roundDate(this.insertedAt); 
    }
  }

  constructor(partial: Partial<TransactionId>) {
    Object.assign(this, partial);
    this.roundDates();
  }
}