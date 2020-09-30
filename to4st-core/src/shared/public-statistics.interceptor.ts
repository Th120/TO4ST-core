import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';


import { AppConfigService } from '../core/app-config.service';
import { roleToAuthLevel } from './auth.utils';


/**
 * Interceptor denies none role requests if public stats not enabled
 */
@Injectable()
export class PublicStatisticsInterceptor implements NestInterceptor {

  constructor(private readonly appConfigService: AppConfigService) {}

  /**
   * Intercepts request
   * @param ctx 
   * @param next 
   */
  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {

    const context = GqlExecutionContext.create(ctx).getContext();
    const level = roleToAuthLevel(context?.role);
    const cfg = await this.appConfigService.getAppConfig(true);

    if(level < 1 && !cfg.publicStats)
    {
      throw new HttpException(`Missing authorization or public player statistics not enabled`, HttpStatus.FORBIDDEN);
    }

    return next.handle();
  }
}
