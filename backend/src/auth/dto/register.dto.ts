import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Chidi', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50)
  displayName!: string;

  @ApiProperty({
    example: '08031234567',
    description:
      'Nigerian mobile number in any common format. Normalized to E.164 (+234...) server-side.',
  })
  @IsString()
  @MinLength(1, { message: 'Phone number is required' })
  phone!: string;

  @ApiProperty({ example: 'hunter2hunter2', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'Password must at least 8 characters' })
  @MaxLength(72)
  password!: string;
}
