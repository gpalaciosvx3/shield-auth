import { v4 as uuidv4 } from 'uuid';
import { CustomException } from '../../../common/errors/custom.exception';
import { ErrorDictionary, InputError } from '../../../common/errors/error.dictionary';

export class RefreshTokenEntity {
  private constructor(
    readonly tokenId: string,
    readonly userId: string,
    readonly deviceId: string,
    readonly expiresAt: number,
    readonly isRevoked: boolean,
  ) {}

  static build(params: { userId: string; ttlSec: number }): RefreshTokenEntity {
    RefreshTokenEntity.validateInvariants(params);
    return new RefreshTokenEntity(
      uuidv4(),
      params.userId,
      uuidv4(),
      Math.floor(Date.now() / 1000) + params.ttlSec,
      false,
    );
  }


  private static validateInvariants(params: { userId: string; ttlSec: number }): void {
    const rules: Array<[boolean, InputError]> = [
      [!params.userId, ErrorDictionary.INTERNAL_ERROR],
      [params.ttlSec <= 0, ErrorDictionary.INTERNAL_ERROR],
    ];
    rules
      .filter(([failed]) => failed)
      .slice(0, 1)
      .forEach(([, error]) => { throw new CustomException(error); });
  }

  isExpired(): boolean {
    return this.expiresAt < Math.floor(Date.now() / 1000);
  }

  static fromPersistence(raw: { tokenId: string; userId: string; deviceId: string; expiresAt: number; isRevoked: boolean }): RefreshTokenEntity {
    return new RefreshTokenEntity(raw.tokenId, raw.userId, raw.deviceId, raw.expiresAt, raw.isRevoked);
  }
}
