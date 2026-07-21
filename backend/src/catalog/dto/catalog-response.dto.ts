import { ApiProperty } from '@nestjs/swagger';

export class MarketDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ example: 'Mile 3 Market' })
  name!: string;

  @ApiProperty({ example: 'Port Harcourt' })
  lga!: string;

  @ApiProperty({ example: 'Rivers' })
  state!: string;
}

export class UnitDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ example: 'derica' })
  label!: string;
}

export class ItemDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ example: 'Rice (local)' })
  name!: string;

  @ApiProperty({ type: [String], example: ['ofada-type', 'abakaliki rice'] })
  localNames!: string[];

  @ApiProperty({ type: [UnitDto] })
  units!: UnitDto[];
}

export class CatalogMarketsDto {
  @ApiProperty({ type: [MarketDto] })
  markets!: MarketDto[];
}

export class CatalogItemsDto {
  @ApiProperty({ type: [ItemDto] })
  items!: ItemDto[];
}
