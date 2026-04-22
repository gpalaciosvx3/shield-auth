import { Injectable } from '@nestjs/common';
import { AuthService } from '../../domain/service/auth.service';
import { TokenPairEntity } from '../../domain/entities/token-pair.entity';

@Injectable()
export class RefreshAuthUseCase {
  constructor(private readonly authService: AuthService) {}

  execute(refreshToken: string): Promise<TokenPairEntity> {
    return this.authService.refresh(refreshToken);
  }
}
