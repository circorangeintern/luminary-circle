import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrendQueryDto {
  @ApiProperty({ example: 'cmrmtbv820000pwdjwt3ouvbi' })
  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @ApiProperty({ example: 'cmrmtc86f000fpwdjrju0rwac' })
  @IsString()
  @IsNotEmpty()
  marketId!: string;
}