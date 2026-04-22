import { Module } from '@nestjs/common';
import { EnvValidationMiddleware } from '../../../common/middleware/env-validation.middleware';
import { EnvConstants } from '../../../common/constants/env.constants';
import { envConfig } from '../../../common/config/env.config';
import { RedisClient } from '../../../common/redis/redis.client';
import { BlacklistCacheRepository } from '../../domain/repository/blacklist.cache.repository';
import { BlacklistCacheRepositoryImpl } from '../repository/blacklist.cache.repository.impl';
import { JwtVerifierService } from '../../domain/service/jwt-verifier.service';
import { AuthorizerService } from '../../domain/service/authorizer.service';
import { AuthorizeUseCase } from '../../application/use-cases/authorize.usecase';
import { AuthorizerController } from '../controller/authorizer.controller';

@Module({
  controllers: [AuthorizerController],
  providers: [
    EnvValidationMiddleware.register(EnvConstants.REQUERIDAS_AUTHORIZER),
    { provide: RedisClient, useFactory: () => new RedisClient() },
    {
      provide: BlacklistCacheRepository,
      useFactory: (redis: RedisClient) => new BlacklistCacheRepositoryImpl(redis),
      inject: [RedisClient],
    },
    {
      provide: JwtVerifierService,
      useFactory: () => new JwtVerifierService({
        secret: envConfig.jwtSecret,
        expiresIn: envConfig.jwtExpiresIn,
      }),
    },
    {
      provide: AuthorizerService,
      useFactory: (jwtVerifier: JwtVerifierService, blacklistRepo: BlacklistCacheRepository) =>
        new AuthorizerService(jwtVerifier, blacklistRepo),
      inject: [JwtVerifierService, BlacklistCacheRepository],
    },
    {
      provide: AuthorizeUseCase,
      useFactory: (authorizerService: AuthorizerService) => new AuthorizeUseCase(authorizerService),
      inject: [AuthorizerService],
    },
  ],
})
export class AuthorizerModule {}
