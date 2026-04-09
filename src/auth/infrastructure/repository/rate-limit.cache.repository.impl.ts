import { Injectable } from '@nestjs/common';
import { RateLimitCacheRepository } from '../../domain/repository/rate-limit.cache.repository';
import { withRedisBreaker, redisClient } from '../../../common/config/redis.config';
import { RedisConstants } from '../../../common/constants/redis.constants';

@Injectable()
export class RateLimitCacheRepositoryImpl extends RateLimitCacheRepository {
  async increment(ip: string, windowSec: number): Promise<number> {
    const key = RedisConstants.rateLimitKey(ip);
    return withRedisBreaker(async () => {
      const n = await redisClient.incr(key);
      if (n === 1) await redisClient.expire(key, windowSec);
      return n;
    });
  }

  async getCount(ip: string): Promise<number> {
    const key = RedisConstants.rateLimitKey(ip);
    const count = await withRedisBreaker(() => redisClient.get(key));
    return count !== null ? Number(count) : 0;
  }
}
