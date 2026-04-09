import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../../domain/service/auth.service';
import { LogoutResultEntity } from '../../domain/entities/logout-result.entity';

@Injectable()
export class LogoutAuthUseCase {
  private readonly logger = new Logger(LogoutAuthUseCase.name);

  constructor(private readonly authService: AuthService) {}

  execute(refreshToken: string, accessToken: string): Promise<LogoutResultEntity> {
    this.logger.log(`---------- LOGOUT => tokenId: ${refreshToken} ----------`);
    return this.authService.logout(refreshToken, accessToken);
  }
}
