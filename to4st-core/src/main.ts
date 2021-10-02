/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

/**
 * Start application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = app.get(ConfigService).get<number>("port");

  app.enableShutdownHooks();
  
  await app.listen(port);
  Logger.log("Listening on port: " + port.toString(), "NestApplication");
}
bootstrap();
