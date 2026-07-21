import { ApiProperty } from '@nestjs/swagger';

export class PriceItemDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ example: 'Rice (local)' })
  name!: string;
}

export class PriceUnitDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ example: 'derica' })
  label!: string;
}

export class PriceMarketDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;
  
  @ApiProperty({ example: 'Mile 3 Market' })
  name!: string;

  @ApiProperty({ example: 'Port Harcourt' })
  lga!: string;

  @ApiProperty({ example: 'Rivers' })
  state!: string;
}

export class PriceDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ type: [PriceItemDto] })
  item!: PriceItemDto;

  @ApiProperty({ type: [PriceUnitDto] })
  unit!: PriceUnitDto;

  @ApiProperty({ type: [PriceMarketDto] })
  market!: PriceMarketDto;

  @ApiProperty({ example: 2100 })
  price!: number;

  @ApiProperty({ example: null, nullable: true })
  note!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'REAL_USER' })
  source!: string;

  @ApiProperty({ example: false })
  isStale!: boolean;

  @ApiProperty({ example: false })
  isFlagged!: boolean;

  @ApiProperty({ example: 0 })
  flagCount!: number;
  
  @ApiProperty({ example: 'Chidi' })
  submitterDisplayName!: string;

  @ApiProperty({ example: '2026-07-19T09:00:00.000Z' })
  createdAt!: string;
}


export class PriceResponseDto {
  @ApiProperty({ type: PriceDto })
  price!: PriceDto;
}