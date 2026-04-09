import { ApiProperty } from '@nestjs/swagger';
import { TokenPairEntity } from '../../../domain/entities/token-pair.entity';

export class RefreshResponseDto implements TokenPairEntity {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  declare accessToken: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  declare refreshToken: string;

  @ApiProperty({ example: 900 })
  declare expiresIn: number;
}
