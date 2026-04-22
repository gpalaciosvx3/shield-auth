import { Injectable } from '@nestjs/common';
import { RateLimitCacheRepository } from '../../domain/repository/rate-limit.cache.repository';
import { RedisClient } from '../../../common/redis/redis.client';
import { RedisConstants } from '../../../common/constants/redis.constants';

@Injectable()
export class RateLimitCacheRepositoryImpl extends RateLimitCacheRepository {
  constructor(private readonly redis: RedisClient) {
    super();
  }

  async increment(ip: string, windowSec: number): Promise<number> {
    const key = RedisConstants.rateLimitKey(ip);
    const n = await this.redis.incr(key);
    if (n === 1) await this.redis.expire(key, windowSec);
    return n;
  }

  async getCount(ip: string): Promise<number> {
    const key = RedisConstants.rateLimitKey(ip);
    const count = await this.redis.get(key);
    return count !== null ? Number(count) : 0;
  }
}
