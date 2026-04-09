import { Injectable } from '@nestjs/common';
import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { AuthorizeUseCase } from '../../application/use-cases/authorize.usecase';
import { PolicyBuilder } from '../helpers/policy.builder';

@Injectable()
export class AuthorizerController {
  constructor(private readonly authorizeUseCase: AuthorizeUseCase) {}

  async handle(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
    try {
      const payload = await this.authorizeUseCase.execute(event.headers ?? {});
      return PolicyBuilder.allow(event.methodArn, payload);
    } catch {
      return PolicyBuilder.deny(event.methodArn);
    }
  }
}
