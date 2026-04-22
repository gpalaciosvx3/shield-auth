import { Injectable } from '@nestjs/common';
import { redisRawClient } from '../config/aws.config';
import { withRedisBreaker } from './redis.breaker';
import { awsError } from '../errors/aws-error.mapper';
import { ErrorDictionary } from '../errors/error.dictionary';

@Injectable()
export class RedisClient {
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.fire(() => redisRawClient.set(key, value, 'EX', ttlSeconds));
  }

  async get(key: string): Promise<string | null> {
    return this.fire(() => redisRawClient.get(key));
  }

  async exists(key: string): Promise<boolean> {
    return this.fire(async () => Boolean(await redisRawClient.exists(key)));
  }

  async incr(key: string): Promise<number> {
    return this.fire(() => redisRawClient.incr(key));
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.fire(() => redisRawClient.expire(key, seconds));
  }

  private fire<T>(fn: () => Promise<T>): Promise<T> {
    return awsError(() => withRedisBreaker(fn), ErrorDictionary.REDIS_UNAVAILABLE);
  }
}
