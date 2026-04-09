import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export abstract class RefreshTokenDbRepository {
  abstract create(token: RefreshTokenEntity): Promise<void>;
  abstract findById(tokenId: string): Promise<RefreshTokenEntity | null>;
  abstract revoke(tokenId: string): Promise<void>;
  abstract rotate(oldTokenId: string, newToken: RefreshTokenEntity): Promise<void>;
}
