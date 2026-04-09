import 'dotenv/config';
import { createFastifyApp } from '../src/common/bootstrap/fastify.factory';
import { PingModule } from '../src/ping/infrastructure/bootstrap/ping.module';

(async () => {
  const app = await createFastifyApp(PingModule);
  await app.listen({ port: 3000, host: '0.0.0.0' });
  console.log('Server:  http://localhost:3000');
  console.log('Docs:    http://localhost:3000/docs');
  console.log('OpenAPI: http://localhost:3000/docs-json');
})();
