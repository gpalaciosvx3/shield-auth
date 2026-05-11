import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WorkerRoleConstruct } from './constructs/iam/worker-role.construct';
import { HttpApiConstruct } from './constructs/api-gateway/http-api.construct';
import { ShieldVpcConstruct } from './constructs/vpc/shield-vpc.construct';
import { RedisClusterConstruct } from './constructs/elasticache/redis-cluster.construct';
import { AuthTablesConstruct } from './constructs/dynamodb/auth-tables.construct';
import { AuthFnConstruct } from './constructs/lambda/auth/auth-fn.construct';
import { AuthorizerFnConstruct } from './constructs/lambda/authorizer/authorizer-fn.construct';
import { JwtSecretConstruct } from './constructs/ssm/jwt-secret.construct';

interface AppStackProps extends cdk.StackProps {
  jwtSecret: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    new WorkerRoleConstruct(this, 'WorkerRole');

    const { vpc, lambdaSecurityGroup } = new ShieldVpcConstruct(this, 'Vpc');

    const redis = new RedisClusterConstruct(this, 'Redis', {
      vpc,
      lambdaSecurityGroup,
    });

    const tables = new AuthTablesConstruct(this, 'Tables');

    const { param: jwtSecretParam } = new JwtSecretConstruct(this, 'JwtSecret', {
      value: props.jwtSecret,
    });

    const authFn = new AuthFnConstruct(this, 'AuthFn', {
      vpc,
      lambdaSecurityGroup,
      redisHost: redis.host,
      redisPort: redis.port,
      usersTable: tables.usersTable,
      refreshTokensTable: tables.refreshTokensTable,
      jwtSecretParam,
    });

    const authorizerFn = new AuthorizerFnConstruct(this, 'AuthorizerFn', {
      vpc,
      lambdaSecurityGroup,
      redisHost: redis.host,
      redisPort: redis.port,
      jwtSecretParam,
    });

    const api = new HttpApiConstruct(this, 'HttpApi', {
      authFn: authFn.fn,
      authorizerFn: authorizerFn.fn,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'AuthorizerFunctionArn', {
      value: api.authorizerArn,
      description: 'ARN del Lambda Authorizer — usar en otros API Gateways',
      exportName: 'shield-auth-authorizer-arn',
    });
  }
}
