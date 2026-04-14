export class InfraConstants {
  static readonly LAMBDA_TIMEOUT_DEFAULT_SECONDS = 30;
  static readonly LAMBDA_MEMORY_DEFAULT_MB       = 256;

  static readonly REDIS_NODE_TYPE      = 'cache.t4g.micro';
  static readonly REDIS_ENGINE_VERSION = '7.1';

  static readonly DYNAMODB_TTL_ATTRIBUTE = 'expiresAt';

  static readonly JWT_EXPIRES_IN_SEC      = '900';
  static readonly REFRESH_TOKEN_TTL_SEC   = '604800';
  static readonly RATE_LIMIT_MAX_ATTEMPTS = '5';
  static readonly RATE_LIMIT_WINDOW_SEC   = '60';
}
