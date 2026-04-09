import { APIGatewayProxyResult } from 'aws-lambda';
import { createLambdaHandler } from '../../../common/bootstrap/lambda.factory';
import { LambdaEventMiddleware } from '../../../common/middleware/lambda-event.middleware';
import { PingModule } from './ping.module';
import { PingController } from '../controller/ping.controller';

export const handler = createLambdaHandler<PingController, unknown, APIGatewayProxyResult>(
  PingModule,
  PingController,
  (ctrl, _event) => {
    LambdaEventMiddleware.extract(_event);
    return ctrl.handle();
  },
);
