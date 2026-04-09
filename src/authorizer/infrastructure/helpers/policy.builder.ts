import { APIGatewayAuthorizerResult } from 'aws-lambda';
import { AuthorizerConstants } from '../constants/authorizer.constants';
import { JwtPayload } from '../../domain/types/jwt-payload.types';

export class PolicyBuilder {
  static allow(methodArn: string, payload: JwtPayload): APIGatewayAuthorizerResult {
    return PolicyBuilder.build(AuthorizerConstants.EFFECT_ALLOW, methodArn, {
      userId: payload.sub,
      email: payload.email,
    });
  }

  static deny(methodArn: string): APIGatewayAuthorizerResult {
    return PolicyBuilder.build(AuthorizerConstants.EFFECT_DENY, methodArn);
  }

  private static build(
    effect: typeof AuthorizerConstants.EFFECT_ALLOW | typeof AuthorizerConstants.EFFECT_DENY,
    methodArn: string,
    context?: Record<string, string>,
  ): APIGatewayAuthorizerResult {
    return {
      principalId: AuthorizerConstants.PRINCIPAL_ID,
      policyDocument: {
        Version: AuthorizerConstants.POLICY_VERSION,
        Statement: [{ Action: AuthorizerConstants.POLICY_ACTION, Effect: effect, Resource: methodArn }],
      },
      context,
    };
  }
}
