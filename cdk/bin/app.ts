import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app.stack';
import { LocalStage } from '../common/stages/local.stage';
import { DevStage } from '../common/stages/dev.stage';

const stage  = process.env.CDK_STAGE ?? 'local';
const config = stage === 'dev' ? DevStage : LocalStage;

const app = new cdk.App();

new AppStack(app, 'AppStack', {
  config,
  env: {
    account: config.account,
    region:  config.region,
  },
});
