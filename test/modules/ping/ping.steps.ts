import 'reflect-metadata';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { PingService } from '../../../src/ping/domain/service/ping.service';
import { PingUseCase } from '../../../src/ping/application/use-cases/ping.usecase';
import { PingRepositoryImpl } from '../../../src/ping/infrastructure/repository/ping.repository.impl';
import { PingResult } from '../../../src/ping/domain/types/ping-result.type';

const feature = loadFeature('./test/modules/ping/features/ping.feature');

defineFeature(feature, test => {
  test('El endpoint de ping retorna pong con timestamp', ({ given, when, then, and }) => {
    let useCase: PingUseCase;
    let result: PingResult;

    given('el servicio está disponible', () => {
      const repository = new PingRepositoryImpl();
      const service    = new PingService(repository);
      useCase          = new PingUseCase(service);
    });

    when('se ejecuta el caso de uso ping', async () => {
      result = await useCase.execute();
    });

    then(/^la respuesta tiene message "(.*)"$/, (expected: string) => {
      expect(result.message).toBe(expected);
    });

    and('la respuesta tiene un timestamp', () => {
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });
});
