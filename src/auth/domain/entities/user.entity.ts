import { compareSync } from 'bcryptjs';

export class UserEntity {
  private constructor(
    readonly userId: string,
    readonly email: string,
    private readonly passwordHash: string,
    readonly createdAt: string,
  ) {}

  static fromPersistence(raw: { userId: string; email: string; passwordHash: string; createdAt: string }): UserEntity {
    return new UserEntity(raw.userId, raw.email, raw.passwordHash, raw.createdAt);
  }

  verifyPassword(plain: string): boolean {
    return compareSync(plain, this.passwordHash);
  }
}
