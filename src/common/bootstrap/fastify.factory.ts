import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { LambdaLogger } from '../logger/lambda.logger';

export const createFastifyApp = async (Module: Type): Promise<NestFastifyApplication> => {
  const app = await NestFactory.create<NestFastifyApplication>(
    Module,
    new FastifyAdapter({ logger: false }),
    { logger: new LambdaLogger('', { logLevels: ['log', 'warn', 'error'] }) },
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.init();
  return app;
};
