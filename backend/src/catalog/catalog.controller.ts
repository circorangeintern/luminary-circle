import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogItemsDto, CatalogMarketsDto } from './dto/catalog-response.dto';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('items')
  @ApiOperation({ summary: 'Get items with their valid units' })
  @ApiResponse({
    status: 200,
    description: 'Items request successful',
    type: CatalogItemsDto,
  })
  async items() {
    return await this.catalog.getItems();
  }

  @Get('markets')
  @ApiOperation({ summary: 'Get all active markets' })
  @ApiResponse({
    status: 200,
    description: 'Markets request successful',
    type: CatalogMarketsDto,
  })
  async markets() {
    return await this.catalog.getMarkets();
  }
}
