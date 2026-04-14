export type UserRaw = {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type RefreshTokenRaw = {
  tokenId: string;
  userId: string;
  deviceId: string;
  expiresAt: number;
  isRevoked: boolean;
};
