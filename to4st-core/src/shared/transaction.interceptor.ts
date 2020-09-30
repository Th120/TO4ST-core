import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';


import { TransactionIdService } from '../core/transaction-id.service';


/**
 * Interceptor used to implement at-most-once semantics
 * Inserts transaction id from header, removes if handler throws error
 * If the transaction id of a successful operation is reused a copy of the original response is sent
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {

  constructor(private readonly transactionIdService: TransactionIdService) {}

  /**
   * Intercepts request
   * @param ctx 
   * @param next 
   */
  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {

    const context = GqlExecutionContext.create(ctx).getContext();
    const requestId = context.headers?.["x-request-id"];
    context.requestId = requestId;

    if(!requestId)
    {
        throw new HttpException(`Missing X-Request-ID in http header`, HttpStatus.PRECONDITION_FAILED);
    }

    const [success, oldResult] = await this.transactionIdService.requestTransaction(requestId);

    if(!success && !!oldResult)
    {
      context.alreadyHandled = true;
      return of(oldResult);
    }

    return next.handle().pipe(
      catchError(async err => {
        await this.transactionIdService.removeTransactionId(requestId);
        throw err;
      }
    ));
  }
}
