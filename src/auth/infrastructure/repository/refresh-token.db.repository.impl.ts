import { Injectable } from '@nestjs/common';
import { RefreshTokenDbRepository } from '../../domain/repository/refresh-token.db.repository';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { DynamoClient } from '../../../common/dynamo/dynamo.client';
import { envConfig } from '../../../common/config/env.config';
import { AuthMapper } from './common/auth.mapper';
import { RefreshTokenRaw } from './common/auth.types';

@Injectable()
export class RefreshTokenDbRepositoryImpl extends RefreshTokenDbRepository {
  constructor(private readonly dynamo: DynamoClient) {
    super();
  }

  async create(token: RefreshTokenEntity): Promise<void> {
    await this.dynamo.put(envConfig.refreshTokensTable, token);
  }

  async findById(tokenId: string): Promise<RefreshTokenEntity | null> {
    const raw = await this.dynamo.get<RefreshTokenRaw>(envConfig.refreshTokensTable, { tokenId });
    return raw ? AuthMapper.toRefreshTokenEntity(raw) : null;
  }

  async revoke(tokenId: string): Promise<void> {
    await this.dynamo.updateFields(envConfig.refreshTokensTable, { tokenId }, { isRevoked: true });
  }

  async rotate(oldTokenId: string, newToken: RefreshTokenEntity): Promise<void> {
    await Promise.all([
      this.dynamo.updateFields(envConfig.refreshTokensTable, { tokenId: oldTokenId }, { isRevoked: true }),
      this.dynamo.put(envConfig.refreshTokensTable, newToken),
    ]);
  }
}
