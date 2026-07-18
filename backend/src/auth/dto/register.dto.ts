import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50)
  displayName!: string;

  @IsString()
  @MinLength(1, { message: 'Phone number is required' })
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'Password must at least 8 characters' })
  @MaxLength(72)
  password!: string;
}
