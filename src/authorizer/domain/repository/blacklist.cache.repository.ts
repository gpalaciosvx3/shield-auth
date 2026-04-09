export abstract class BlacklistCacheRepository {
  abstract exists(jti: string): Promise<boolean>;
}
