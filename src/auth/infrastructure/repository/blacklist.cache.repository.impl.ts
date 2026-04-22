import { Injectable } from '@nestjs/common';
import { BlacklistCacheRepository } from '../../domain/repository/blacklist.cache.repository';
import { RedisClient } from '../../../common/redis/redis.client';
import { RedisConstants } from '../../../common/constants/redis.constants';

@Injectable()
export class BlacklistCacheRepositoryImpl extends BlacklistCacheRepository {
  constructor(private readonly redis: RedisClient) {
    super();
  }

  async add(jti: string, ttlSeconds: number): Promise<void> {
    const key = RedisConstants.blacklistKey(jti);
    await this.redis.set(key, '1', ttlSeconds);
  }
}
