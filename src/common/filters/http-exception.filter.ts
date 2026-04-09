import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { JsonWebTokenError } from 'jsonwebtoken';
import { CustomException } from '../errors/custom.exception';
import { ErrorDictionary } from '../errors/error.dictionary';
import { ApiErrorBody } from '../types/api-response.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();

    if (exception instanceof CustomException) {
      const body: ApiErrorBody = exception.toResponseBody();
      response.status(exception.statusCode).send(body);
      return;
    }

    if (exception instanceof JsonWebTokenError) {
      const body: ApiErrorBody = {
        code: ErrorDictionary.REFRESH_TOKEN_INVALID.code,
        description: ErrorDictionary.REFRESH_TOKEN_INVALID.descripcion,
      };
      response.status(ErrorDictionary.REFRESH_TOKEN_INVALID.statusCode).send(body);
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).send({
        code: 'HTTP_ERROR',
        description: exception.message,
      } satisfies ApiErrorBody);
      return;
    }

    const detail = exception instanceof Error ? exception.message : String(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      code: ErrorDictionary.INTERNAL_ERROR.code,
      description: `Ocurrió un error inesperado: ${detail}`,
    } satisfies ApiErrorBody);
  }
}
