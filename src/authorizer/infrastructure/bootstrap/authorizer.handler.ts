import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { AuthorizerModule } from './authorizer.module';
import { AuthorizerController } from '../controller/authorizer.controller';

let app: INestApplicationContext;

async function getApp(): Promise<INestApplicationContext> {
  if (!app) {
    app = await NestFactory.createApplicationContext(AuthorizerModule, { logger: false });
    await app.init();
  }
  return app;
}

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  const context = await getApp();
  return context.get(AuthorizerController).handle(event);
};
