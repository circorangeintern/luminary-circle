import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CreateFlagDto {
  @ApiProperty({
    example: 'WRONG_PRICE',
    enum: ['WRONG_PRICE', 'OUTDATED', 'OTHER'],
  })
  @IsString()
  @IsIn(['WRONG_PRICE', 'OUTDATED', 'OTHER'], {
    message: 'Reason must be WRONG_PRICE, OUTDATED or OTHER',
  })
  reason!: string;
}

export class FlagResponseDto {
  @ApiProperty({ example: 'cmrm...' })
  flagId!: string;

  @ApiProperty({ example: 'cmrm...' })
  submissionId!: string;

  @ApiProperty({ example: 2 })
  flagCount!: number;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'UNDER_REVIEW', 'REMOVED'],
  })
  submissionStatus!: string;
}
