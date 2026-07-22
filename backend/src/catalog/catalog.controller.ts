import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogItemsDto, CatalogMarketsDto } from './dto/catalog-response.dto';
import { CompareResponseDto } from '../prices/dto/compare-response.dto';
import { ErrorResponseDto } from '../common/errors/error-response.dto';
import { CompareQueryDto } from '../prices/dto/compare-query.dto';
import { PricesService } from '../prices/prices.service';
import { TrendResponseDto } from '../prices/dto/trend-response.dto';
import { TrendQueryDto } from '../prices/dto/trend-query.dto';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly prices: PricesService,
  ) {}

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

  @Get('items/:itemId/trend')
  @ApiOperation({ summary: 'Price trend direction for an item at one market' })
  @ApiResponse({
    status: 200,
    description: 'Trend result',
    type: TrendResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid item, unit, or market',
    type: ErrorResponseDto,
  })
  async trend(@Param('itemId') itemId: string, @Query() query: TrendQueryDto) {
    return this.prices.trend(itemId, query.unitId, query.marketId);
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

  @Get('markets/compare')
  @ApiOperation({
    summary: 'Compare the latest price for an item across markets',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparison result',
    type: CompareResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid item or unit',
    type: ErrorResponseDto,
  })
  async compare(@Query() query: CompareQueryDto) {
    return this.prices.compare(query.itemId, query.unitId);
  }
}
