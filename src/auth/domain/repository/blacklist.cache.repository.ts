export abstract class BlacklistCacheRepository {
  abstract add(jti: string, ttlSeconds: number): Promise<void>;
}
