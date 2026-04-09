import { ApiProperty } from '@nestjs/swagger';
import { PingResult } from '../../domain/types/ping-result.type';

export class PingResponseDto implements PingResult {
  @ApiProperty({ example: 'pong' })
  declare message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  declare timestamp: string;
}
