import { Injectable } from '@nestjs/common';
import { UserDbRepository } from '../../domain/repository/user.db.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { DynamoClient } from '../../../common/dynamo/dynamo.client';
import { envConfig } from '../../../common/config/env.config';

@Injectable()
export class UserDbRepositoryImpl extends UserDbRepository {
  constructor(private readonly dynamo: DynamoClient) {
    super();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const results = await this.dynamo.query<UserEntity>(envConfig.usersTable, {
      index: 'email-index',
      keyCondition: '#email = :email',
      attributeNames: { '#email': 'email' },
      attributeValues: { ':email': email },
    });
    return results[0] ?? null;
  }
}
