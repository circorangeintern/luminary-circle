import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePriceDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ example: 'cmrqexjbk00005kdjpslfsdfc' })
  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @ApiProperty({ example: 'cmrqexjbk00005kdjpsfweroq' })
  @IsString()
  @IsNotEmpty()
  marketId!: string;

  @ApiProperty({ example: 2100, minimum: 10, maximum: 10_000_000 })
  @IsInt({ message: 'Price must be a whole number of naira' })
  @Min(10, { message: 'Price seems too low' })
  @Max(10_000_000, { message: 'Price seems too high' })
  price!: number;

  @ApiProperty({ example: 'price for the big derica', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
