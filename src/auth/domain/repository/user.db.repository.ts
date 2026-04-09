import { UserEntity } from '../entities/user.entity';

export abstract class UserDbRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
}
