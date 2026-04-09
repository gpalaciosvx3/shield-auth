export abstract class BlacklistCacheRepository {
  abstract add(jti: string, ttlSeconds: number): Promise<void>;
  abstract exists(jti: string): Promise<boolean>;
}
