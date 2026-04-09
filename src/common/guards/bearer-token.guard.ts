import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CustomException } from '../errors/custom.exception';
import { ErrorDictionary } from '../errors/error.dictionary';
import { HttpConstants } from '../constants/http.constants';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new CustomException(ErrorDictionary.REFRESH_TOKEN_INVALID);
    }

    const token = authorization.slice(7);
    (request as FastifyRequest & Record<string, unknown>)[HttpConstants.ACCESS_TOKEN_KEY] = token;
    return true;
  }
}
