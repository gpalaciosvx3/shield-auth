import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../../domain/service/auth.service';
import { TokenPairEntity } from '../../domain/entities/token-pair.entity';

@Injectable()
export class RefreshAuthUseCase {
  private readonly logger = new Logger(RefreshAuthUseCase.name);


  constructor(private readonly authService: AuthService) {}

  execute(refreshToken: string): Promise<TokenPairEntity> {
    this.logger.log(`---------- REFRESH => tokenId: ${refreshToken} ----------`);
    return this.authService.refresh(refreshToken);
  }
}
