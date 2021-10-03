import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ClassSerializerInterceptor, PlainLiteralObject, Logger } from '@nestjs/common';
import { Observable, } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { map } from 'rxjs/operators';
import { Role } from './auth.utils';
import { TransactionIdService } from '../core/transaction-id.service';
import { Reflector } from '@nestjs/core';

/**
 * Serializes response data based on role from context
 * Saves response data for transaction id if used
 */
@Injectable()
export class RoleClassSerializerInterceptor extends ClassSerializerInterceptor {

  constructor(protected readonly reflector: Reflector, private readonly transactionIdService: TransactionIdService, ) {
    super(reflector);
  }

  /**
   * Intercepts request
   * @param ctx 
   * @param next 
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> 
  {
    const ctx = GqlExecutionContext.create(context).getContext();
    return next
      .handle()
      .pipe(
        map((res: PlainLiteralObject | Array<PlainLiteralObject>) =>
          {
            if(!ctx.alreadyHandled)
            {
              return this.serialize(res, { strategy: "excludeAll", groups: [ctx.role ?? Role.none]});
            }
            return res;
          }
        ),
        map(async result => {
            if(!!ctx.requestId && !ctx.alreadyHandled)
            {
                await this.transactionIdService.setResultTransaction(ctx.requestId, result);
            }
            return result;
        })
      );
  }
}
