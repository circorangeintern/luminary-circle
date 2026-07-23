import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMarketRequestDto {
  @ApiProperty({ example: 'Rumuokor Market' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  proposedName!: string;

  @ApiProperty({ example: 'Obio/Akpor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lga!: string;

  @ApiProperty({ example: 'Rivers' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;
}

export class MarketRequestDto {
  @ApiProperty({ example: 'cmrm...' })
  id!: string;

  @ApiProperty({ example: 'Rumuokoro Market' })
  proposedName!: string;

  @ApiProperty({ example: 'Obio/Akpor' })
  lga!: string;

  @ApiProperty({ example: 'Rivers' })
  state!: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'DECLINED'],
  })
  status!: string;

  @ApiProperty({ example: '2026-07-23T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: null, nullable: true })
  reviewedAt!: string | null;
}

export class MarketRequestListDto {
  @ApiProperty({ type: [MarketRequestDto] })
  requests!: MarketRequestDto[];
}
