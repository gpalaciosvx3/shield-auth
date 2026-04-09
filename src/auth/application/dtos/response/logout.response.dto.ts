import { ApiProperty } from '@nestjs/swagger';
import { LogoutResultEntity } from '../../../domain/entities/logout-result.entity';

export class LogoutResponseDto implements LogoutResultEntity {
  @ApiProperty({ example: 'Sesión cerrada correctamente' })
  declare message: string;
}
