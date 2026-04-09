import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../../domain/service/auth.service';
import { TokenPairEntity } from '../../domain/entities/token-pair.entity';

@Injectable()
export class LoginAuthUseCase {
  private readonly logger = new Logger(LoginAuthUseCase.name);

  constructor(private readonly authService: AuthService) {}

  execute(email: string, password: string, ip: string): Promise<TokenPairEntity> {
    this.logger.log(`---------- LOGIN => email: ${email} | ip: ${ip} ----------`);
    return this.authService.login(email, password, ip);
  }
}
