
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { Expose } from 'class-transformer';

/**
 * Interface for paginated type
 */
export interface IPaginated<T> {
  new (partial: Partial<IPaginated<T>>): {content: T[],  totalCount: number,  pageCount: number};
}

/**
 * Wrapper object type for pagination
 * @param classRef 
 * @returns paginated object type
 */
export function Paginated<T>(classRef: Type<T>){
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType<T> {
    @Expose()
    @Field((type) => [classRef], { nullable: true })
    content: T[];
    @Expose()
    @Field((type) => Int)
    totalCount: number;
    @Expose()
    @Field((type) => Int)
    pageCount: number;

    constructor(partial: Partial<PaginatedType<T>>) {
      Object.assign(this, partial);
    }
  }
  return PaginatedType as IPaginated<T>;
}