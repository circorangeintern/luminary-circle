import { ApiProperty } from '@nestjs/swagger';
import { PriceDto, PriceItemDto, PriceMarketDto, PriceUnitDto } from './price-response.dto';

export class TrendPointDto {
  @ApiProperty({ example: 2100 })
  price!: number;

  @ApiProperty({ example: '2026-07-15T09:00:00.000Z' })
  createdAt!: string;
}

export class TrendResponseDto {
  @ApiProperty({ type: PriceItemDto })
  item!: PriceItemDto;

  @ApiProperty({ type: PriceUnitDto })
  unit!: PriceUnitDto;

  @ApiProperty({ type: PriceMarketDto })
  market!: PriceMarketDto;

  @ApiProperty({
    example: 'UP',
    enum: ['UP', 'DOWN', 'STABLE', 'INSUFFICIENT_DATA'],
  })
  direction!: string;

  @ApiProperty({ example: 4 })
  sampleSize!: number;

  @ApiProperty({ type: PriceDto, nullable: true })
  latest!: PriceDto | null;

  @ApiProperty({ type: [TrendPointDto] })
  points!: TrendPointDto[];
}