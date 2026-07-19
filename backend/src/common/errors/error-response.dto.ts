import { ApiProperty } from '@nestjs/swagger';

class ErrorDetailDto {
  @ApiProperty({ example: 'phone' })
  field!: string;

  @ApiProperty({ example: 'Not a valid Nigerian mobile number' })
  message!: string;
}

class ErrorBodyDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code!: string;

  @ApiProperty({ example: 'Invalid phone number' })
  message!: string;

  @ApiProperty({ type: [ErrorDetailDto], required: false })
  details?: ErrorDetailDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ type: ErrorBodyDto })
  error!: ErrorBodyDto;
}
