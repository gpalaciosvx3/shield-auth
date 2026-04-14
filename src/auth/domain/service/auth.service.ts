import { Injectable, Logger } from '@nestjs/common';
import { UserDbRepository } from '../repository/user.db.repository';
import { RateLimitCacheRepository } from '../repository/rate-limit.cache.repository';
import { RefreshTokenDbRepository } from '../repository/refresh-token.db.repository';
import { BlacklistCacheRepository } from '../repository/blacklist.cache.repository';
import { JwtService } from './jwt.service';
import { TokenPairEntity } from '../entities/token-pair.entity';
import { UserEntity } from '../entities/user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { LogoutResultEntity } from '../entities/logout-result.entity';
import { CustomException } from '../../../common/errors/custom.exception';
import { ErrorDictionary, InputError } from '../../../common/errors/error.dictionary';
import { AuthServiceConfig } from '../types/service-config.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserDbRepository,
    private readonly rateLimitRepo: RateLimitCacheRepository,
    private readonly refreshTokenRepo: RefreshTokenDbRepository,
    private readonly blacklistRepo: BlacklistCacheRepository,
    private readonly jwtService: JwtService,
    private readonly config: AuthServiceConfig,
  ) {}

  async login(email: string, password: string, ip: string): Promise<TokenPairEntity> {
    this.logger.log(`[PASO 1] Validando límite de intentos => ip: ${ip}`);
    await this.assertNotRateLimited(ip);

    this.logger.log(`[PASO 2] Validando credenciales => email: ${email}`);
    const user = await this.validateCredentials(email, password, ip);
    
    this.logger.log(`[PASO 3] Generando tokens => userId: ${user.userId}`);
    const { accessToken, expiresIn } = this.jwtService.signToken(user);

    this.logger.log(`[PASO 4] Almacenando refresh token => userId: ${user.userId}`);
    const refreshToken = RefreshTokenEntity.build({ userId: user.userId, ttlSec: this.config.refreshTokenTtlSec });
    await this.refreshTokenRepo.create(refreshToken);

    this.logger.log(`FIN => Refresh token almacenado => userId: ${user.userId}`);
    return { accessToken, refreshToken: refreshToken.tokenId, expiresIn };
  }

  async refresh(refreshToken: string): Promise<TokenPairEntity> {
    this.logger.log(`[PASO 1] Buscando refresh token => tokenId: ${refreshToken}`);
    const existing = await this.refreshTokenRepo.findById(refreshToken);

    this.logger.log(`[PASO 2] Validando refresh token => tokenId: ${refreshToken}`);
    const validated = this.assertRefreshTokenValid(existing, refreshToken);

    this.logger.log(`[PASO 3] Validando usuario => userId: ${validated.userId}`);
    const user = await this.resolveUser(validated.userId);

    this.logger.log(`[PASO 4] Generando nuevo access token => userId: ${validated.userId}`);
    const { accessToken, expiresIn } = this.jwtService.signToken(user);

    this.logger.log(`[PASO 5] Rotando refresh token => userId: ${validated.userId}`);
    const newRefreshToken = RefreshTokenEntity.build({ userId: validated.userId, ttlSec: this.config.refreshTokenTtlSec });
    await this.refreshTokenRepo.rotate(validated.tokenId, newRefreshToken);

    this.logger.log(`FIN => Refresh exitoso => userId: ${validated.userId}`);
    return { accessToken, refreshToken: newRefreshToken.tokenId, expiresIn };
  }

  async logout(refreshToken: string, accessToken: string): Promise<LogoutResultEntity> {
    this.logger.log(`[PASO 1] Decodificando access token => tokenId: ${accessToken}`);
    const payload = this.jwtService.decode(accessToken);

    this.logger.log(`[PASO 2] Revocando refresh token => tokenId: ${refreshToken}`);
    const ttl = this.jwtService.getRemainingTtl(payload);

    this.logger.log(`[PASO 3] Agregando access token a blacklist => jti: ${payload.jti} | ttl: ${ttl}s`);
    await Promise.all([
      this.refreshTokenRepo.revoke(refreshToken),
      this.blacklistRepo.add(payload.jti, ttl),
    ]);

    this.logger.log(`FIN => Logout exitoso => userId: ${payload.sub}`);
    return { message: 'Sesión cerrada correctamente' };
  }

  private async resolveUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepo.findByEmail(userId);
    if (!user) {
      this.logger.error(`Usuario no encontrado => userId: ${userId}`);
      throw new CustomException(ErrorDictionary.USER_NOT_FOUND);
    }
    return user;
  }

  private async assertNotRateLimited(ip: string): Promise<void> {
    const count = await this.rateLimitRepo.getCount(ip);
    this.logger.log(`Intentos de login para ip ${ip}: ${count}`);
    if (count >= this.config.rateLimitMaxAttempts) {
      this.logger.warn(`Límite de intentos excedido => ip: ${ip} | intentos: ${count}`);
      throw new CustomException(ErrorDictionary.RATE_LIMIT_EXCEEDED);
    }
  }

  private async validateCredentials(email: string, password: string, ip: string): Promise<UserEntity> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.verifyPassword(password)) {
      this.logger.warn(`Credenciales inválidas => email: ${email}`);
      await this.rateLimitRepo.increment(ip, this.config.rateLimitWindowSec);
      throw new CustomException(ErrorDictionary.INVALID_CREDENTIALS);
    }
    return user;
  }

  private assertRefreshTokenValid(token: RefreshTokenEntity | null, tokenId: string): RefreshTokenEntity {
    const rules: Array<[boolean, InputError, string]> = [
      [!token,               ErrorDictionary.REFRESH_TOKEN_INVALID, `Refresh token no encontrado => tokenId: ${tokenId}`],
      [!!token?.isRevoked,   ErrorDictionary.REFRESH_TOKEN_REUSED,  `Refresh token ya fue rotado => tokenId: ${tokenId}`],
      [!!token?.isExpired(), ErrorDictionary.REFRESH_TOKEN_INVALID, `Refresh token expirado => tokenId: ${tokenId}`],
    ];
    rules
      .filter(([failed]) => failed)
      .slice(0, 1)
      .forEach(([, error, message]) => {
        this.logger.warn(message);
        throw new CustomException(error);
      });
    return token as RefreshTokenEntity;
  }
}
