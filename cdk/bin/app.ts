import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app.stack';

const app = new cdk.App();

new AppStack(app, 'AppStack', {
  jwtSecret: process.env.JWT_SECRET ?? 'REPLACE_ME_IN_ENV',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:  process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});
