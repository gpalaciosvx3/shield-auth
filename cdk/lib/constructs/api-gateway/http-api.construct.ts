import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ResourceConstants } from '../../../common/constants/resource.constants';

interface HttpApiProps {
  pingFn: lambda.IFunction;
  stage: string;
}

export class HttpApiConstruct extends Construct {
  readonly url: string;

  constructor(scope: Construct, id: string, props: HttpApiProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: ResourceConstants.API_NAME,
      description: 'API REST del proyecto',
      deployOptions: {
        stageName: props.stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      },
    });

    const apiKey = new apigateway.ApiKey(this, 'ApiKey', {
      apiKeyName: `${ResourceConstants.API_NAME}-KEY`,
      description: 'API Key para acceso al API',
    });

    const usagePlan = new apigateway.UsagePlan(this, 'UsagePlan', {
      name: `${ResourceConstants.API_NAME}-PLAN`,
      apiStages: [{ api, stage: api.deploymentStage }],
      throttle: { rateLimit: 100, burstLimit: 200 },
    });

    usagePlan.addApiKey(apiKey);

    const pingIntegration = new apigateway.LambdaIntegration(props.pingFn);

    const v1   = api.root.addResource('v1');
    const ping = v1.addResource('ping');
    ping.addMethod('GET', pingIntegration, { apiKeyRequired: true });

    this.url = api.url;
  }
}
