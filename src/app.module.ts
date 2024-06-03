import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { configApp } from './config/app/config.app';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CoreModule } from './core/core.module';
import { ApiModule } from './api/api.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomExceptionFilter } from './shared/filters/exceptions.filter';
import { ResponseInterceptor } from './shared/intenceptors/response.interceptor';
import { DatabaseModule } from './config/database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configApp],
      envFilePath: ['.env'],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: configApp().redis.host,
            port: configApp().redis.port,
          },
          username: configApp().redis.username,
          password: configApp().redis.password,
          ttl: configApp().redis.ttl * 1000,
        }),
      }),
    }),

    ServeStaticModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => [
        {
          rootPath: join(__dirname, '..', 'swagger-static'),
          serveRoot: configApp().env === 'development' ? '/' : '/swagger',
        },
      ],
    }),

    ThrottlerModule.forRootAsync({
      useFactory: async () => [
        {
          ttl: configApp().ttl,
          limit: configApp().limit,
        },
      ],
    }),

    CoreModule,
    ApiModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
