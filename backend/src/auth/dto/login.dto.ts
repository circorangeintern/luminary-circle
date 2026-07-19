import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '08031234567',
    description:
      'Nigerian mobile number in any common format. Normalized to E.164 (+234...) server-side.',
  })
  @IsString()
  @MinLength(1)
  phone!: string;

  @ApiProperty({ example: 'hunter2hunter2', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(1)
  password!: string;
}
