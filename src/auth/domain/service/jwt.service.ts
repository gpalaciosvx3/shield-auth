import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../entities/user.entity';
import { JwtServiceConfig, JwtPayload } from '../types/service-config.types';

@Injectable()
export class JwtService {
  constructor(private readonly config: JwtServiceConfig) {}

  signToken(user: UserEntity): { accessToken: string; expiresIn: number } {
    const jti = uuidv4();
    const accessToken = sign(
      { sub: user.userId, email: user.email, jti },
      this.config.secret,
      { expiresIn: this.config.expiresIn, algorithm: 'HS256' },
    );
    return { accessToken, expiresIn: this.config.expiresIn };
  }

  decode(token: string): JwtPayload {
    return verify(token, this.config.secret) as JwtPayload;
  }

  getRemainingTtl(payload: JwtPayload): number {
    return Math.max(payload.exp - Math.floor(Date.now() / 1000), 0);
  }
}
