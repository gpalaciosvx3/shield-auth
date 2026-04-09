import { Module } from '@nestjs/common';
import { EnvValidationMiddleware } from '../../../common/middleware/env-validation.middleware';
import { EnvConstants } from '../../../common/constants/env.constants';
import { envConfig } from '../../../common/config/env.config';
import { DynamoClient } from '../../../common/dynamo/dynamo.client';
import { UserDbRepository } from '../../domain/repository/user.db.repository';
import { UserDbRepositoryImpl } from '../repository/user.db.repository.impl';
import { RefreshTokenDbRepository } from '../../domain/repository/refresh-token.db.repository';
import { RefreshTokenDbRepositoryImpl } from '../repository/refresh-token.db.repository.impl';
import { RateLimitCacheRepository } from '../../domain/repository/rate-limit.cache.repository';
import { RateLimitCacheRepositoryImpl } from '../repository/rate-limit.cache.repository.impl';
import { BlacklistCacheRepository } from '../../domain/repository/blacklist.cache.repository';
import { BlacklistCacheRepositoryImpl } from '../repository/blacklist.cache.repository.impl';
import { JwtService } from '../../domain/service/jwt.service';
import { AuthService } from '../../domain/service/auth.service';
import { LoginAuthUseCase } from '../../application/use-cases/login-auth.usecase';
import { RefreshAuthUseCase } from '../../application/use-cases/refresh-auth.usecase';
import { LogoutAuthUseCase } from '../../application/use-cases/logout-auth.usecase';
import { AuthController } from '../controller/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    EnvValidationMiddleware.register(EnvConstants.REQUERIDAS_AUTH),
    DynamoClient,
    {
      provide: UserDbRepository,
      useFactory: (dynamo: DynamoClient) => new UserDbRepositoryImpl(dynamo),
      inject: [DynamoClient],
    },
    {
      provide: RefreshTokenDbRepository,
      useFactory: (dynamo: DynamoClient) => new RefreshTokenDbRepositoryImpl(dynamo),
      inject: [DynamoClient],
    },
    {
      provide: RateLimitCacheRepository,
      useFactory: () => new RateLimitCacheRepositoryImpl(),
    },
    {
      provide: BlacklistCacheRepository,
      useFactory: () => new BlacklistCacheRepositoryImpl(),
    },
    {
      provide: JwtService,
      useFactory: () => new JwtService({
        secret: envConfig.jwtSecret,
        expiresIn: envConfig.jwtExpiresIn,
      }),
    },
    {
      provide: AuthService,
      useFactory: (
        userRepo: UserDbRepository,
        rateLimitRepo: RateLimitCacheRepository,
        refreshTokenRepo: RefreshTokenDbRepository,
        blacklistRepo: BlacklistCacheRepository,
        jwtService: JwtService,
      ) => new AuthService(userRepo, rateLimitRepo, refreshTokenRepo, blacklistRepo, jwtService, {
        rateLimitMaxAttempts: envConfig.rateLimitMaxAttempts,
        rateLimitWindowSec: envConfig.rateLimitWindowSec,
        refreshTokenTtlSec: envConfig.refreshTokenTtlSec,
      }),
      inject: [UserDbRepository, RateLimitCacheRepository, RefreshTokenDbRepository, BlacklistCacheRepository, JwtService],
    },
    {
      provide: LoginAuthUseCase,
      useFactory: (svc: AuthService) => new LoginAuthUseCase(svc),
      inject: [AuthService],
    },
    {
      provide: RefreshAuthUseCase,
      useFactory: (svc: AuthService) => new RefreshAuthUseCase(svc),
      inject: [AuthService],
    },
    {
      provide: LogoutAuthUseCase,
      useFactory: (svc: AuthService) => new LogoutAuthUseCase(svc),
      inject: [AuthService],
    },
  ],
})
export class AuthModule {}
