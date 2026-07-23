import { Global, Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtModule } from '@nestjs/jwt';
import { AnalyticsController } from './analytics.controller';

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
