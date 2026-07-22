import { ApiProperty } from '@nestjs/swagger';
import {
  PriceDto,
  PriceItemDto,
  PriceMarketDto,
  PriceUnitDto,
} from './price-response.dto';

export class ComparisonEntryDto {
  @ApiProperty({ type: PriceMarketDto })
  market!: PriceMarketDto;

  @ApiProperty({ type: PriceDto })
  latestPrice!: PriceDto;

  @ApiProperty({
    example: true,
    description: 'True for exactly one entry, and only when comparisonPossible',
  })
  isCheapest!: boolean;
}

export class CompareResponseDto {
  @ApiProperty({ type: PriceItemDto })
  item!: PriceItemDto;

  @ApiProperty({ type: PriceUnitDto })
  unit!: PriceUnitDto;

  @ApiProperty({ type: [ComparisonEntryDto] })
  comparison!: ComparisonEntryDto[];

  @ApiProperty({ example: 2 })
  marketsWithData!: number;

  @ApiProperty({
    example: true,
    description: 'False when fewer than two markets have data',
  })
  comparisonPossible!: boolean;
}
