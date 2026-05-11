import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ResourceConstants } from '../../../common/constants/resource.constants';

interface HttpApiProps {
  authFn: lambda.IFunction;
  authorizerFn: lambda.IFunction;
}

export class HttpApiConstruct extends Construct {
  readonly url: string;
  readonly authorizerArn: string;

  constructor(scope: Construct, id: string, props: HttpApiProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: ResourceConstants.API_NAME,
      description: 'API REST del proyecto Shield Auth',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      },
    });

    const v1   = api.root.addResource('v1');
    const auth  = v1.addResource('auth');
    const login   = auth.addResource('login');
    const refresh = auth.addResource('refresh');
    const logout  = auth.addResource('logout');

    const authIntegration = new apigateway.LambdaIntegration(props.authFn);

    login.addMethod('POST', authIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    refresh.addMethod('POST', authIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    logout.addMethod('POST', authIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    this.url = api.url;
    this.authorizerArn = props.authorizerFn.functionArn;
  }
}
