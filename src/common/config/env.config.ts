import { EnvConstants } from '../constants/env.constants';

export const envConfig = {
  awsRegion:             process.env[EnvConstants.AWS_REGION] ?? 'us-east-1',

  redisHost:             process.env[EnvConstants.REDIS_HOST] as string,
  redisPort:             Number(process.env[EnvConstants.REDIS_PORT] ?? 6379),

  usersTable:            process.env[EnvConstants.USERS_TABLE] as string,
  refreshTokensTable:    process.env[EnvConstants.REFRESH_TOKENS_TABLE] as string,

  jwtSecret:             process.env[EnvConstants.JWT_SECRET] as string,
  jwtExpiresIn:          Number(process.env[EnvConstants.JWT_EXPIRES_IN] ?? 900),

  refreshTokenTtlSec:    Number(process.env[EnvConstants.REFRESH_TOKEN_TTL_SEC] ?? 2592000),

  rateLimitMaxAttempts:  Number(process.env[EnvConstants.RATE_LIMIT_MAX_ATTEMPTS] ?? 5),
  rateLimitWindowSec:    Number(process.env[EnvConstants.RATE_LIMIT_WINDOW_SEC] ?? 60),
};
