import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompareQueryDto {
  @ApiProperty({ example: 'cmrmtby0c000apwdjuuy3cixh' })
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ example: 'cmrmtbv820000pwdjwt3ouvbi' })
  @IsString()
  @IsNotEmpty()
  unitId!: string;
}
