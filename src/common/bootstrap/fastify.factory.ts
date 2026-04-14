import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { LambdaLogger } from '../logger/lambda.logger';

export const createFastifyApp = async (Module: Type, swagger = true): Promise<NestFastifyApplication> => {
  const app = await NestFactory.create<NestFastifyApplication>(
    Module,
    new FastifyAdapter({ logger: false }),
    { logger: new LambdaLogger('', { logLevels: ['log', 'warn', 'error'] }) },
  );

  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (swagger) {
    const config = new DocumentBuilder()
      .setTitle('ShieldAuth API')
      .setDescription('Servicio de autenticación centralizado')
      .setVersion('1.0')
      .build();

    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }

  await app.init();
  return app;
};
