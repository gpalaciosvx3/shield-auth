import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ResourceConstants } from '../../../common/constants/resource.constants';
import { InfraConstants } from '../../../common/constants/infra.constants';

export class AuthTablesConstruct extends Construct {
  readonly usersTable: dynamodb.Table;
  readonly refreshTokensTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: ResourceConstants.TABLE_USERS,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.refreshTokensTable = new dynamodb.Table(this, 'RefreshTokensTable', {
      tableName: ResourceConstants.TABLE_REFRESH_TOKENS,
      partitionKey: { name: 'tokenId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: InfraConstants.DYNAMODB_TTL_ATTRIBUTE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }
}
