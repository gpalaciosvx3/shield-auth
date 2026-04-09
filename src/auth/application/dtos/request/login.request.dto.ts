import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  declare email: string;

  @ApiProperty({ example: 'secret' })
  @IsString()
  @MinLength(6)
  declare password: string;
}
