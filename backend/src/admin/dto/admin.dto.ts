import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { PriceDto } from '../../prices/dto/price-response.dto';
import { MarketRequestDto } from '../../market-requests/dto/market-request.dto';

export class ModerationActionDto {
  @ApiProperty({
    example: 'RESTORE',
    enum: ['RESTORE', 'REMOVE'],
  })
  @IsString()
  @IsIn(['RESTORE', 'REMOVE'], {
    message: 'Action must be RESTORE or REMOVE',
  })
  action!: string;
}

export class RequestReviewDto {
  @ApiProperty({
    example: 'APPROVE',
    enum: ['APPROVE', 'DECLINE'],
  })
  @IsString()
  @IsIn(['APPROVE', 'DECLINE'], {
    message: 'Action must be APPROVE or DECLINE',
  })
  action!: string;
}

export class ModerationItemDto {
  @ApiProperty({ type: PriceDto })
  price!: PriceDto;

  @ApiProperty({ example: 3 })
  flagCount!: number;

  @ApiProperty({ example: ['WRONG_PRICE', 'OUTDATED'] })
  reasons!: string[];
}

export class ModerationQueueDto {
  @ApiProperty({ type: [ModerationItemDto] })
  items!: ModerationItemDto[];
}

export class AdminRequestListDto {
  @ApiProperty({ type: [MarketRequestDto] })
  requests!: MarketRequestDto[];
}
