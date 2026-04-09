import { Injectable, Logger } from '@nestjs/common';
import { JwtPayload } from '../../domain/types/jwt-payload.types';
import { AuthorizerService } from '../../domain/service/authorizer.service';
import { HttpConstants } from '../../../common/constants/http.constants';

@Injectable()
export class AuthorizeUseCase {
  private readonly logger = new Logger(AuthorizeUseCase.name);

  constructor(private readonly authorizerService: AuthorizerService) {}

  execute(headers: Record<string, string | undefined>): Promise<JwtPayload> {
    const rawAuth = headers[HttpConstants.AUTHORIZATION_HEADER]
                 ?? headers[HttpConstants.AUTHORIZATION_HEADER_LOWER]
                 ?? '';
    this.logger.log(`---------- AUTHORIZER => rawAuthorizationHeaderPresent: ${rawAuth.length > 0} ----------`);
    return this.authorizerService.authorize(rawAuth);
  }
}
