import 'dotenv/config';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../src/ping/infrastructure/bootstrap/ping.handler';

const event: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: 'POST /ping',
  rawPath: '/ping',
  rawQueryString: '',
  headers: { 'content-type': 'application/json' },
  requestContext: {
    accountId: '000000000000',
    apiId: 'local',
    domainName: 'localhost',
    domainPrefix: 'local',
    http: { method: 'POST', path: '/ping', protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'local-runner' },
    requestId: 'local-req-ping',
    routeKey: 'POST /ping',
    stage: '$default',
    time: new Date().toISOString(),
    timeEpoch: Date.now(),
  },
  body: JSON.stringify({
    body: 'Cuerpo de prueba'
  }),
  isBase64Encoded: false,
};

handler(event).then(result => {
  if (typeof result === 'object') {
    console.log('status:', result.statusCode);
    console.log('body:  ', JSON.parse(result.body as string));
  }
}).catch(console.error);
