import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { envConfig } from './env.config';

export const dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: envConfig.awsRegion }));
