import { HttpStatus } from '@nestjs/common';

export type InputError = {
  readonly code: string;
  readonly descripcion: string;
  readonly statusCode: number;
};

export class ErrorDictionary {
  static readonly INTERNAL_ERROR: InputError = {
    code: 'APP-001',
    descripcion: 'Ocurrió un error inesperado',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  };

  static readonly ENV_VAR_MISSING: InputError = {
    code: 'APP-002',
    descripcion: 'Variable de entorno requerida no encontrada',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  };

  static readonly VALIDATION_ERROR: InputError = {
    code: 'APP-003',
    descripcion: 'El cuerpo de la solicitud no es válido',
    statusCode: HttpStatus.BAD_REQUEST,
  };

  static readonly INVALID_CREDENTIALS: InputError = {
    code: 'AUTH-001',
    descripcion: 'Credenciales inválidas',
    statusCode: HttpStatus.UNAUTHORIZED,
  };

  static readonly RATE_LIMIT_EXCEEDED: InputError = {
    code: 'AUTH-002',
    descripcion: 'Demasiados intentos fallidos, intente de nuevo más tarde',
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
  };

  static readonly REFRESH_TOKEN_INVALID: InputError = {
    code: 'AUTH-003',
    descripcion: 'Refresh token inválido o expirado',
    statusCode: HttpStatus.UNAUTHORIZED,
  };

  static readonly REFRESH_TOKEN_REUSED: InputError = {
    code: 'AUTH-004',
    descripcion: 'Refresh token ya fue rotado',
    statusCode: HttpStatus.UNAUTHORIZED,
  };

  static readonly USER_NOT_FOUND: InputError = {
    code: 'AUTH-005',
    descripcion: 'El usuario asociado al token no existe',
    statusCode: HttpStatus.UNAUTHORIZED,
  };
}
