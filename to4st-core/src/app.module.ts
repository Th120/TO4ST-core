import { Module, ValidationPipe, } from '@nestjs/common';
import { ConfigModule, } from '@nestjs/config';
import { TypeOrmModule, } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import configuration from './configuration';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';


import { RoleClassSerializerInterceptor } from './shared/role-class-serializer.interceptor';
import { GameStatisticsModule } from './game-statistics/game-statistics.module';
import { AllExceptionsFilter } from './shared/all-exceptions.filter';
import testConfiguration from './testConfiguration';
import { GameserverModule } from './gameserver/gameserver.module';
import { AppCoreModule } from './core/app-core.module';
import {TypeOrmConfigService} from './type-orm-config.service'
import { AuthGuard } from './shared/auth.guard';


/**
 * Root app module
 */
@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true, 
        load: [process.env.NODE_ENV === "test" ? testConfiguration : configuration],
        validationSchema: Joi.object({
          NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .default('production'),
          PORT: Joi.number().default(3000)
        }),
      }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    GraphQLModule.forRoot(
      { 
        fieldResolverEnhancers: ["interceptors", "guards", "filters"],
        autoSchemaFile: true,
        playground: process.env.NODE_ENV !== "production",
        context: ({ req }) => ({ headers: req.headers }),
      }
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/graphql*'],
    }),
    AppCoreModule, 
    GameserverModule, 
    GameStatisticsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RoleClassSerializerInterceptor,
    },  
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
