import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'cmrqexjbk00005kdjpmoq2mo3' })
  id!: string;

  @ApiProperty({ example: 'Chidi' })
  displayName!: string;

  @ApiProperty({ example: '+2348031234567' })
  phone!: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  role!: string;
}

export class AuthDataDto {
  @ApiProperty({ type: UserDto })
  user!: UserDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AuthDataDto })
  data!: AuthDataDto;
}