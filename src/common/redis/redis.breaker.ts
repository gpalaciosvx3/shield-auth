import CircuitBreaker from 'opossum';
import { RedisConstants } from '../constants/redis.constants';

const breaker = new CircuitBreaker(
  (fn: () => Promise<unknown>): Promise<unknown> => fn(),
  {
    timeout: RedisConstants.BREAKER_TIMEOUT_MS,
    errorThresholdPercentage: RedisConstants.BREAKER_ERROR_THRESHOLD_PERCENT,
    resetTimeout: RedisConstants.BREAKER_RESET_TIMEOUT_MS,
  },
);

export const withRedisBreaker = <T>(fn: () => Promise<T>): Promise<T> =>
  breaker.fire(fn) as Promise<T>;
