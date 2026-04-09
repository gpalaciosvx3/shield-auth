import { Injectable } from '@nestjs/common';
import { BlacklistCacheRepository } from '../../domain/repository/blacklist.cache.repository';
import { withRedisBreaker, redisClient } from '../../../common/config/redis.config';
import { RedisConstants } from '../../../common/constants/redis.constants';

@Injectable()
export class BlacklistCacheRepositoryImpl extends BlacklistCacheRepository {
  async add(jti: string, ttlSeconds: number): Promise<void> {
    const key = RedisConstants.blacklistKey(jti);
    await withRedisBreaker(() => redisClient.set(key, '1', 'EX', ttlSeconds));
  }

  async exists(jti: string): Promise<boolean> {
    const key = RedisConstants.blacklistKey(jti);
    const result = await withRedisBreaker(() => redisClient.exists(key));
    return result === 1;
  }
}
