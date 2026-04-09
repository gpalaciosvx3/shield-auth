export class RedisConstants {
  static readonly KEEP_ALIVE_MS = 10000;
  static readonly CONNECT_TIMEOUT_MS = 3000;
  static readonly RETRY_MAX_DELAY_MS = 2000;
  static readonly RETRY_BASE_MS = 100;

  static readonly BREAKER_TIMEOUT_MS = 2000;
  static readonly BREAKER_ERROR_THRESHOLD_PERCENT = 50;
  static readonly BREAKER_RESET_TIMEOUT_MS = 10000;

  static readonly rateLimitKey = (ip: string): string => `ratelimit:${ip}`;
  static readonly blacklistKey = (jti: string): string => `blacklist:${jti}`;
}
