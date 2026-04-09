import Redis from 'ioredis';
import CircuitBreaker from 'opossum';
import { envConfig } from './env.config';
import { RedisConstants } from '../constants/redis.constants';

const client = new Redis({
  host: envConfig.redisHost,
  port: envConfig.redisPort,
  lazyConnect: false,
  keepAlive: RedisConstants.KEEP_ALIVE_MS,
  connectTimeout: RedisConstants.CONNECT_TIMEOUT_MS,
  retryStrategy: (times: number) => Math.min(times * RedisConstants.RETRY_BASE_MS, RedisConstants.RETRY_MAX_DELAY_MS),
});

const breakerOptions: CircuitBreaker.Options = {
  timeout: RedisConstants.BREAKER_TIMEOUT_MS,
  errorThresholdPercentage: RedisConstants.BREAKER_ERROR_THRESHOLD_PERCENT,
  resetTimeout: RedisConstants.BREAKER_RESET_TIMEOUT_MS,
};

const breaker = new CircuitBreaker(
  (fn: () => Promise<unknown>): Promise<unknown> => fn(),
  breakerOptions,
);

export const withRedisBreaker = <T>(fn: () => Promise<T>): Promise<T> =>
  breaker.fire(fn) as Promise<T>;

export const redisClient = client;
