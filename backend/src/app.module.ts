import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { CatalogModule } from './catalog/catalog.module';
import { PricesModule } from './prices/prices.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigService } from './config/app-config.service';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Redis } from 'ioredis';
import { MarketRequestsModule } from './market-requests/market-requests.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    AppConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            // 10 submissions per user per hour
            name: 'submissions-hourly',
            ttl: 3_600_000,
            limit: config.priceSubmitLimitPerHour,
            getTracker: (req: { user?: { id: string }; ip?: string }) =>
              req.user?.id ?? req.ip ?? 'anonymous',
          },
          {
            // 5 per user per (item, market) per hour
            name: 'submissions-per-market',
            ttl: 3_600_000,
            limit: config.priceSubmitLimitPerMarketPerHour,
            getTracker: (req: {
              user?: { id: string };
              body?: { itemId?: string; marketId?: string };
            }) =>
              `${req.user?.id ?? 'anon'}:${req.body?.itemId}:${req.body?.marketId}`,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis(config.upstashRedisUrl, { maxRetriesPerRequest: 2 }),
        ),
      }),
    }),
    PrismaModule,
    AnalyticsModule,
    AuthModule,
    CatalogModule,
    PricesModule,
    MarketRequestsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
