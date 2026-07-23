import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PriceDto } from './price-response.dto';

export class PriceQueryDto {
  @ApiPropertyOptional({ example: 'cmrmtby0c000apwdjuuy3cixh' })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiPropertyOptional({ example: 'cmrmtbv820000pwdjwt3ouvbi' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({ example: 'cmrmtc86f000fpwdjrju0rwac' })
  @IsOptional()
  @IsString()
  marketId?: string;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number) // query params arrive as strings; transform: true applies this
  @IsInt({ message: 'page must be a whole number' })
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize must be a whole number' })
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class PriceQueryResponseDto {
  @ApiProperty({ type: [PriceDto] })
  items!: PriceDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 156 })
  totalItems!: number;

  @ApiProperty({ example: 8 })
  totalPages!: number;
}
