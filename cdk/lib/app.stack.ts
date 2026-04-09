import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StageConfig } from '../common/types/stage-config.types';
import { WorkerRoleConstruct } from './constructs/iam/worker-role.construct';
import { PingFnConstruct } from './constructs/lambda/ping/ping-fn.construct';
import { HttpApiConstruct } from './constructs/api-gateway/http-api.construct';

interface AppStackProps extends cdk.StackProps {
  config: StageConfig;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    new WorkerRoleConstruct(this, 'WorkerRole');

    const pingFn = new PingFnConstruct(this, 'PingFn');

    const api = new HttpApiConstruct(this, 'HttpApi', {
      pingFn: pingFn.fn,
      stage: props.config.stage,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url, description: 'API Gateway URL' });
  }
}
