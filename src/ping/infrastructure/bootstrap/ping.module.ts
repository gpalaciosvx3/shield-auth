import { Module } from '@nestjs/common';
import { EnvValidationMiddleware } from '../../../common/middleware/env-validation.middleware';
import { EnvConstants } from '../../../common/constants/env.constants';
import { PingRepository } from '../../domain/repository/ping.repository';
import { PingRepositoryImpl } from '../repository/ping.repository.impl';
import { PingService } from '../../domain/service/ping.service';
import { PingUseCase } from '../../application/use-cases/ping.usecase';
import { PingController } from '../controller/ping.controller';

@Module({
  providers: [
    EnvValidationMiddleware.register(EnvConstants.REQUERIDAS_PING),
    {
      provide: PingRepository,
      useFactory: () => new PingRepositoryImpl(),
    },
    {
      provide: PingService,
      useFactory: (repo: PingRepository) => new PingService(repo),
      inject: [PingRepository],
    },
    {
      provide: PingUseCase,
      useFactory: (svc: PingService) => new PingUseCase(svc),
      inject: [PingService],
    },
    {
      provide: PingController,
      useFactory: (uc: PingUseCase) => new PingController(uc),
      inject: [PingUseCase],
    },
  ],
})
export class PingModule {}
