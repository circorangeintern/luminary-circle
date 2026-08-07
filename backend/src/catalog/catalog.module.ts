import { Module } from '@nestjs/common'
import { PricesModule } from '../prices/prices.module'
import { CatalogController } from './catalog.controller'
import { CatalogService } from './catalog.service'

@Module({
  imports: [PricesModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
