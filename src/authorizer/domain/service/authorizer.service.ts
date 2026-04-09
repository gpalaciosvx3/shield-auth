import { Injectable, Logger } from '@nestjs/common';
import { JwtVerifierService } from './jwt-verifier.service';
import { BlacklistCacheRepository } from '../repository/blacklist.cache.repository';
import { JwtPayload } from '../types/jwt-payload.types';
import { CustomException } from '../../../common/errors/custom.exception';
import { ErrorDictionary } from '../../../common/errors/error.dictionary';
import { HttpConstants } from '../../../common/constants/http.constants';

@Injectable()
export class AuthorizerService {
  private readonly logger = new Logger(AuthorizerService.name);

  constructor(
    private readonly jwtVerifier: JwtVerifierService,
    private readonly blacklistRepo: BlacklistCacheRepository,
  ) {}

  async authorize(rawAuth: string): Promise<JwtPayload> {
    this.logger.log('[PASO 1] Extrayendo token de autorización raw => ' + rawAuth.slice(0, 30) + '...');
    const token = this.extractToken(rawAuth);

    this.logger.log('[PASO 2] Verificando token JWT => ' + token.slice(0, 30) + '...');
    const payload = this.jwtVerifier.decode(token);

    this.logger.log(`[PASO 3] Validando token en lista negra => userId: ${payload.sub}`);
    await this.assertNotBlacklisted(payload.jti);

    this.logger.log(`FIN => Autorización concedida => userId: ${payload.sub}`);
    return payload;
  }

  private extractToken(rawAuth: string): string {
    if (!rawAuth.startsWith(HttpConstants.BEARER_PREFIX)) {
      this.logger.warn('Token de autorización ausente o mal formado');
      throw new CustomException(ErrorDictionary.REFRESH_TOKEN_INVALID);
    }
    return rawAuth.slice(HttpConstants.BEARER_PREFIX.length);
  }

  private async assertNotBlacklisted(jti: string): Promise<void> {
    const blacklisted = await this.blacklistRepo.exists(jti);
    if (blacklisted) {
      this.logger.warn(`Token en lista negra => jti: ${jti}`);
      throw new CustomException(ErrorDictionary.REFRESH_TOKEN_INVALID);
    }
  }
}
