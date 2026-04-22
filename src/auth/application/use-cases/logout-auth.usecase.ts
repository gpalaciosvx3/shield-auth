import { Injectable } from '@nestjs/common';
import { AuthService } from '../../domain/service/auth.service';
import { LogoutResultEntity } from '../../domain/entities/logout-result.entity';

@Injectable()
export class LogoutAuthUseCase {
  constructor(private readonly authService: AuthService) {}

  execute(refreshToken: string, accessToken: string): Promise<LogoutResultEntity> {
    return this.authService.logout(refreshToken, accessToken);
  }
}
