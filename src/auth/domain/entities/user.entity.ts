import { compareSync } from 'bcryptjs';

export class UserEntity {
  private constructor(
    readonly userId: string,
    readonly email: string,
    private readonly passwordHash: string,
    readonly createdAt: string,
  ) {}

  verifyPassword(plain: string): boolean {
    return compareSync(plain, this.passwordHash);
  }
}
