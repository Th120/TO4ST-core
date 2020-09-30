import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';


/**
 * Global exception filter
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) 
  {
    if(exception instanceof HttpException)
    {
      const resp: any = exception.getResponse();
      return new HttpException(resp instanceof Object ? resp.message : exception.message, exception.getStatus());
    }
    else
    {
      const internalId = Math.floor(Math.random() * 100000000);
      Logger.error(`Internal Server Error - ID <${internalId}> \n ${exception ? exception : "Could not strigify exception"} \n Stack trace: ${(<any>exception).stack}`);
      return new HttpException(`Internal Server Error - ID <${internalId}>`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}