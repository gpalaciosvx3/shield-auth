export interface JwtVerifierConfig {
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
