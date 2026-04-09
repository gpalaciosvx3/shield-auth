export interface AuthServiceConfig {
  rateLimitMaxAttempts: number;
  rateLimitWindowSec: number;
  refreshTokenTtlSec: number;
}

export interface JwtServiceConfig {
  secret: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
  iat: number;
  exp: number;
}
