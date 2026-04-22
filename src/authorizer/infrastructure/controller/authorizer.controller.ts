import { Injectable, Inject } from '@nestjs/common';
import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { AuthorizeUseCase } from '../../application/use-cases/authorize.usecase';
import { PolicyBuilder } from '../helpers/policy.builder';
import { HandleExecution } from '../../../common/decorator/handle-execution.decorator';

@Injectable()
export class AuthorizerController {
  constructor(@Inject(AuthorizeUseCase) private readonly authorizeUseCase: AuthorizeUseCase) {}

  @HandleExecution('AUTHORIZER')
  async handle(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
    try {
      const payload = await this.authorizeUseCase.execute(event.headers ?? {});
      return PolicyBuilder.allow(event.methodArn, payload);
    } catch {
      return PolicyBuilder.deny(event.methodArn);
    }
  }
}
