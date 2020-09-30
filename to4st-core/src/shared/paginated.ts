
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

/**
 * Interface for paginated type
 */
export interface IPaginated<T> {
  new (): {content: T[],  totalCount: number,  pageCount: number};
}

/**
 * Wrapper object type for pagination
 * @param classRef 
 * @returns paginated object type
 */
export function Paginated<T>(classRef: Type<T>){
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType<T> {
    @Field((type) => [classRef], { nullable: true })
    content: T[];
    @Field((type) => Int)
    totalCount: number;
    @Field((type) => Int)
    pageCount: number;
  }
  return PaginatedType as IPaginated<T>;
}