export class EnvConstants {
  static readonly AWS_REGION = 'AWS_REGION';

  static readonly REDIS_HOST = 'REDIS_HOST';
  static readonly REDIS_PORT = 'REDIS_PORT';

  static readonly USERS_TABLE = 'USERS_TABLE';
  static readonly REFRESH_TOKENS_TABLE = 'REFRESH_TOKENS_TABLE';

  static readonly JWT_SECRET = 'JWT_SECRET';
  static readonly JWT_EXPIRES_IN = 'JWT_EXPIRES_IN';

  static readonly REFRESH_TOKEN_TTL_SEC = 'REFRESH_TOKEN_TTL_SEC';

  static readonly RATE_LIMIT_MAX_ATTEMPTS = 'RATE_LIMIT_MAX_ATTEMPTS';
  static readonly RATE_LIMIT_WINDOW_SEC = 'RATE_LIMIT_WINDOW_SEC';

  static readonly REQUERIDAS_AUTH: readonly string[] = [
    EnvConstants.REDIS_HOST,
    EnvConstants.REDIS_PORT,
    EnvConstants.USERS_TABLE,
    EnvConstants.REFRESH_TOKENS_TABLE,
    EnvConstants.JWT_SECRET,
    EnvConstants.JWT_EXPIRES_IN,
    EnvConstants.REFRESH_TOKEN_TTL_SEC,
    EnvConstants.RATE_LIMIT_MAX_ATTEMPTS,
    EnvConstants.RATE_LIMIT_WINDOW_SEC,
  ];

  static readonly REQUERIDAS_AUTHORIZER: readonly string[] = [
    EnvConstants.REDIS_HOST,
    EnvConstants.REDIS_PORT,
    EnvConstants.JWT_SECRET,
  ];
}
