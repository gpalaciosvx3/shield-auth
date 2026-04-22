import { Injectable } from '@nestjs/common';
import { AuthService } from '../../domain/service/auth.service';
import { TokenPairEntity } from '../../domain/entities/token-pair.entity';

@Injectable()
export class LoginAuthUseCase {
  constructor(private readonly authService: AuthService) {}

  execute(email: string, password: string, ip: string): Promise<TokenPairEntity> {
    return this.authService.login(email, password, ip);
  }
}
