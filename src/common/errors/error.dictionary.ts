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
}
