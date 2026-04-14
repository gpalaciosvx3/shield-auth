import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import awsLambdaFastify, { LambdaResponse } from '@fastify/aws-lambda';
import { FastifyInstance } from 'fastify';
import { createFastifyApp } from '../../../common/bootstrap/fastify.factory';
import { AuthModule } from './auth.module';

type AwsProxyHandler = (event: APIGatewayProxyEvent, context: Context) => Promise<LambdaResponse>;

let proxy: AwsProxyHandler | undefined;

const bootstrap = async (): Promise<AwsProxyHandler> => {
  const app = await createFastifyApp(AuthModule, false);
  const instance = app.getHttpAdapter().getInstance() as unknown as FastifyInstance;
  return awsLambdaFastify<APIGatewayProxyEvent>(instance);
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<LambdaResponse> => {
  if (!proxy) {
    proxy = await bootstrap();
  }
  return proxy(event, context);
};
