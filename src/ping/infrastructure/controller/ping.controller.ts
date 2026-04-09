import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { APIGatewayProxyResult } from 'aws-lambda';
import { PingUseCase } from '../../application/use-cases/ping.usecase';
import { ApiGwHelper } from '../../../common/helpers/api-gw.helper';

@Injectable()
export class PingController {
  private readonly logger = new Logger(PingController.name);

  constructor(private readonly useCase: PingUseCase) {}

  async handle(): Promise<APIGatewayProxyResult> {
    try {
      return ApiGwHelper.success(HttpStatus.OK, await this.useCase.execute());
    } catch (error) {
      this.logger.error('Error en ping', error);
      return ApiGwHelper.error(error);
    }
  }
}
