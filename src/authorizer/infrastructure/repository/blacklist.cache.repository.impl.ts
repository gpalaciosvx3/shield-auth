import { Injectable } from '@nestjs/common';
import { BlacklistCacheRepository } from '../../domain/repository/blacklist.cache.repository';
import { withRedisBreaker, redisClient } from '../../../common/config/redis.config';
import { RedisConstants } from '../../../common/constants/redis.constants';

@Injectable()
export class BlacklistCacheRepositoryImpl extends BlacklistCacheRepository {
  async exists(jti: string): Promise<boolean> {
    const key = RedisConstants.blacklistKey(jti);
    return Boolean(await withRedisBreaker(() => redisClient.exists(key)));
  }
}
