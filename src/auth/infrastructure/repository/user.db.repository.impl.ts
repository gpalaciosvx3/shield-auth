import { Injectable } from '@nestjs/common';
import { UserDbRepository } from '../../domain/repository/user.db.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { DynamoClient } from '../../../common/dynamo/dynamo.client';
import { AuthMapper } from './common/auth.mapper';
import { UserRaw } from './common/auth.types';

@Injectable()
export class UserDbRepositoryImpl extends UserDbRepository {
  constructor(
    private readonly dynamo: DynamoClient,
    private readonly tableName: string,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const results = await this.dynamo.query<UserRaw>(this.tableName, {
      index: 'email-index',
      keyCondition: '#email = :email',
      attributeNames: { '#email': 'email' },
      attributeValues: { ':email': email },
    });
    return results[0] ? AuthMapper.toUserEntity(results[0]) : null;
  }
}
