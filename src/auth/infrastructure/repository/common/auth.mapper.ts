import { UserEntity } from '../../../domain/entities/user.entity';
import { RefreshTokenEntity } from '../../../domain/entities/refresh-token.entity';
import { UserRaw, RefreshTokenRaw } from './auth.types';

export class AuthMapper {
  static toUserEntity(raw: UserRaw): UserEntity {
    return UserEntity.fromPersistence(raw);
  }

  static toRefreshTokenEntity(raw: RefreshTokenRaw): RefreshTokenEntity {
    return RefreshTokenEntity.fromPersistence(raw);
  }
}
