import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { handler } from '../src/authorizer/infrastructure/bootstrap/authorizer.handler';

const event: Partial<APIGatewayRequestAuthorizerEvent> = {
  headers: {
    Authorization: 'Bearer <REEMPLAZAR_CON_TOKEN_VALIDO>',
  },
  methodArn: 'arn:aws:execute-api:us-east-1:123456789012:abcdef123/dev/GET/resource',
};

handler(event as APIGatewayRequestAuthorizerEvent)
  .then((result) => {
    console.log('Resultado del autorizador:');
    console.log(JSON.stringify(result, null, 2));
  });
