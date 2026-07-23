import { Module } from '@nestjs/common';
import { MarketRequestsController } from './market-requests.controller';
import { MarketRequestsService } from './market-requests.service';

@Module({
  controllers: [MarketRequestsController],
  providers: [MarketRequestsService],
  exports: [MarketRequestsService],
})
export class MarketRequestsModule {}
