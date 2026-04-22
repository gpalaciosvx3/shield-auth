import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SSMClient } from '@aws-sdk/client-ssm';
import Redis from 'ioredis';
import { envConfig } from './env.config';
import { RedisConstants } from '../constants/redis.constants';

export const dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: envConfig.awsRegion }));
export const ssmSdkClient = new SSMClient({ region: envConfig.awsRegion });
export const redisRawClient = new Redis({
  host: envConfig.redisHost,
  port: envConfig.redisPort,
  lazyConnect: false,
  keepAlive: RedisConstants.KEEP_ALIVE_MS,
  connectTimeout: RedisConstants.CONNECT_TIMEOUT_MS,
  retryStrategy: (times: number) => Math.min(times * RedisConstants.RETRY_BASE_MS, RedisConstants.RETRY_MAX_DELAY_MS),
});

redisRawClient.on('error', () => undefined);
