import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { lambdaBundling } from '../shared/bundling.config';
import { InfraConstants } from '../../../../common/constants/infra.constants';
import { ResourceConstants } from '../../../../common/constants/resource.constants';
import { LambdaLogGroupConstruct } from '../../cloudwatch/lambda-log-group.construct';

interface AuthFnProps {
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  redisHost: string;
  redisPort: string;
  usersTable: dynamodb.Table;
  refreshTokensTable: dynamodb.Table;
  jwtSecretParam: ssm.StringParameter;
}

export class AuthFnConstruct extends Construct {
  readonly fn: NodejsFunction;

  constructor(scope: Construct, id: string, props: AuthFnProps) {
    super(scope, id);

    const jwtSecret = props.jwtSecretParam.stringValue;

    const { logGroup } = new LambdaLogGroupConstruct(this, 'LogGroup', {
      functionName: ResourceConstants.LAMBDA_AUTH,
    });

    this.fn = new NodejsFunction(this, 'Fn', {
      functionName: ResourceConstants.LAMBDA_AUTH,
      description: 'Auth service — login, refresh, logout',
      logGroup,
      entry: path.join(__dirname, '../../../../../src/auth/infrastructure/bootstrap/auth.handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(InfraConstants.LAMBDA_TIMEOUT_DEFAULT_SECONDS),
      memorySize: InfraConstants.LAMBDA_MEMORY_DEFAULT_MB,
      bundling: lambdaBundling,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.lambdaSecurityGroup],
      environment: {
        REDIS_HOST:              props.redisHost,
        REDIS_PORT:              props.redisPort,
        USERS_TABLE:             props.usersTable.tableName,
        REFRESH_TOKENS_TABLE:    props.refreshTokensTable.tableName,
        JWT_SECRET:              jwtSecret,
        JWT_EXPIRES_IN:          InfraConstants.JWT_EXPIRES_IN_SEC,
        REFRESH_TOKEN_TTL_SEC:   InfraConstants.REFRESH_TOKEN_TTL_SEC,
        RATE_LIMIT_MAX_ATTEMPTS: InfraConstants.RATE_LIMIT_MAX_ATTEMPTS,
        RATE_LIMIT_WINDOW_SEC:   InfraConstants.RATE_LIMIT_WINDOW_SEC,
      },
    });

    props.usersTable.grantReadData(this.fn);
    props.refreshTokensTable.grantReadWriteData(this.fn);
  }
}
