import 'dotenv/config';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LambdaLogger } from './common/logger/lambda.logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { logger: new LambdaLogger('bootstrap', { logLevels: ['log', 'warn', 'error'] }) },
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('ShieldAuth API')
    .setDescription('Servicio de autenticación centralizado')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: '/openapi.json',
  });

  await app.listen({ port: 3000, host: '0.0.0.0' });

  const logger = new Logger('Bootstrap');
  logger.log('Server:  http://localhost:3000 | /docs | /openapi.json');
}

bootstrap();
