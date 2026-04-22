import { Injectable } from '@nestjs/common';
import { BlacklistCacheRepository } from '../../domain/repository/blacklist.cache.repository';
import { RedisClient } from '../../../common/redis/redis.client';
import { RedisConstants } from '../../../common/constants/redis.constants';

@Injectable()
export class BlacklistCacheRepositoryImpl extends BlacklistCacheRepository {
  constructor(private readonly redis: RedisClient) {
    super();
  }

  async exists(jti: string): Promise<boolean> {
    const key = RedisConstants.blacklistKey(jti);
    return this.redis.exists(key);
  }
}
