export abstract class RateLimitCacheRepository {
  abstract increment(ip: string, windowSec: number): Promise<number>;
  abstract getCount(ip: string): Promise<number>;
}
