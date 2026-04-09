import { Injectable } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { JwtVerifierConfig, JwtPayload } from '../types/jwt-payload.types';

@Injectable()
export class JwtVerifierService {
  constructor(private readonly config: JwtVerifierConfig) {}

  decode(token: string): JwtPayload {
    return verify(token, this.config.secret) as JwtPayload;
  }
}
