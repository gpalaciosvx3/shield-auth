import { Logger } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { AuthService } from '../../src/auth/domain/service/auth.service';
import { JwtService } from '../../src/auth/domain/service/jwt.service';
import { UserEntity } from '../../src/auth/domain/entities/user.entity';
import { RefreshTokenEntity } from '../../src/auth/domain/entities/refresh-token.entity';
import { UserDbRepository } from '../../src/auth/domain/repository/user.db.repository';
import { RateLimitCacheRepository } from '../../src/auth/domain/repository/rate-limit.cache.repository';
import { RefreshTokenDbRepository } from '../../src/auth/domain/repository/refresh-token.db.repository';
import { BlacklistCacheRepository } from '../../src/auth/domain/repository/blacklist.cache.repository';
import { AuthServiceConfig, JwtServiceConfig } from '../../src/auth/domain/types/service-config.types';
import { ErrorDictionary } from '../../src/common/errors/error.dictionary';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

// ─── Fixtures ────────────────────────────────────────────────────────────────

const PASSWORD = 'Test1234!';
const PASSWORD_HASH = hashSync(PASSWORD, 1);

const jwtConfig: JwtServiceConfig = { secret: 'test-secret-key', expiresIn: 900 };

const serviceConfig: AuthServiceConfig = {
  rateLimitMaxAttempts: 5,
  rateLimitWindowSec: 60,
  refreshTokenTtlSec: 604800,
};

const buildUser = (): UserEntity =>
  UserEntity.fromPersistence({
    userId: 'usr-001',
    email: 'user@test.com',
    passwordHash: PASSWORD_HASH,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

const buildValidToken = (): RefreshTokenEntity =>
  RefreshTokenEntity.fromPersistence({
    tokenId: 'tok-001',
    userId: 'usr-001',
    deviceId: 'dev-001',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    isRevoked: false,
  });

const buildRevokedToken = (): RefreshTokenEntity =>
  RefreshTokenEntity.fromPersistence({
    tokenId: 'tok-002',
    userId: 'usr-001',
    deviceId: 'dev-001',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    isRevoked: true,
  });

const buildExpiredToken = (): RefreshTokenEntity =>
  RefreshTokenEntity.fromPersistence({
    tokenId: 'tok-003',
    userId: 'usr-001',
    deviceId: 'dev-001',
    expiresAt: Math.floor(Date.now() / 1000) - 3600,
    isRevoked: false,
  });

const buildMocks = () => ({
  userRepo: { findByEmail: jest.fn<Promise<UserEntity | null>, [string]>() },
  rateLimitRepo: {
    getCount: jest.fn<Promise<number>, [string]>(),
    increment: jest.fn<Promise<number>, [string, number]>(),
  },
  refreshTokenRepo: {
    findById: jest.fn<Promise<RefreshTokenEntity | null>, [string]>(),
    create: jest.fn<Promise<void>, [RefreshTokenEntity]>(),
    rotate: jest.fn<Promise<void>, [string, RefreshTokenEntity]>(),
    revoke: jest.fn<Promise<void>, [string]>(),
  },
  blacklistRepo: { add: jest.fn<Promise<void>, [string, number]>() },
});

type Mocks = ReturnType<typeof buildMocks>;

const buildService = (repos: Mocks, jwtSvc?: JwtService): AuthService =>
  new AuthService(
    repos.userRepo as unknown as UserDbRepository,
    repos.rateLimitRepo as unknown as RateLimitCacheRepository,
    repos.refreshTokenRepo as unknown as RefreshTokenDbRepository,
    repos.blacklistRepo as unknown as BlacklistCacheRepository,
    jwtSvc ?? new JwtService(jwtConfig),
    serviceConfig,
  );

// ─── Feature: Login ───────────────────────────────────────────────────────────

describe('Feature: Login de usuario', () => {
  let mocks: Mocks;
  let service: AuthService;

  beforeEach(() => {
    mocks = buildMocks();
    service = buildService(mocks);
  });

  it.each<[string, number, UserEntity | null, string, string, string, boolean]>([
    ['rate limit excedido', 5, null, 'user@test.com', PASSWORD, ErrorDictionary.RATE_LIMIT_EXCEEDED.code, false],
    ['usuario no existe', 0, null, 'noexiste@test.com', PASSWORD, ErrorDictionary.INVALID_CREDENTIALS.code, true],
    ['contraseña incorrecta', 0, buildUser(), 'user@test.com', 'WrongPassword!', ErrorDictionary.INVALID_CREDENTIALS.code, true],
  ])('Esquema: Login rechazado — %s', async (_, intentos, usuario, email, password, codigoError, debeIncrementar) => {
    mocks.rateLimitRepo.getCount.mockResolvedValue(intentos);
    mocks.userRepo.findByEmail.mockResolvedValue(usuario);
    mocks.rateLimitRepo.increment.mockResolvedValue(1);

    await expect(service.login(email, password, '1.2.3.4'))
      .rejects.toMatchObject({ code: codigoError });

    if (debeIncrementar) {
      expect(mocks.rateLimitRepo.increment).toHaveBeenCalledWith('1.2.3.4', serviceConfig.rateLimitWindowSec);
    }
  });

  it('Scenario: Login exitoso — retorna par de tokens y almacena refresh token', async () => {
    mocks.rateLimitRepo.getCount.mockResolvedValue(0);
    mocks.userRepo.findByEmail.mockResolvedValue(buildUser());
    mocks.refreshTokenRepo.create.mockResolvedValue();

    const result = await service.login('user@test.com', PASSWORD, '1.2.3.4');

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.expiresIn).toBe(jwtConfig.expiresIn);
    expect(mocks.refreshTokenRepo.create).toHaveBeenCalledTimes(1);
    expect(mocks.refreshTokenRepo.create).toHaveBeenCalledWith(expect.any(RefreshTokenEntity));
  });
});

// ─── Feature: Refresh ─────────────────────────────────────────────────────────

describe('Feature: Rotación de refresh token', () => {
  let mocks: Mocks;
  let service: AuthService;

  beforeEach(() => {
    mocks = buildMocks();
    service = buildService(mocks);
  });

  it.each<[string, RefreshTokenEntity | null, string]>([
    ['no encontrado', null, ErrorDictionary.REFRESH_TOKEN_INVALID.code],
    ['revocado', buildRevokedToken(), ErrorDictionary.REFRESH_TOKEN_REUSED.code],
    ['expirado', buildExpiredToken(), ErrorDictionary.REFRESH_TOKEN_INVALID.code],
  ])('Esquema: Refresh rechazado — token %s', async (_, token, codigoError) => {
    mocks.refreshTokenRepo.findById.mockResolvedValue(token);

    await expect(service.refresh('tok-test'))
      .rejects.toMatchObject({ code: codigoError });
  });

  it('Scenario: Usuario no existe — lanza AUTH-005', async () => {
    mocks.refreshTokenRepo.findById.mockResolvedValue(buildValidToken());
    mocks.userRepo.findByEmail.mockResolvedValue(null);

    await expect(service.refresh('tok-001'))
      .rejects.toMatchObject({ code: ErrorDictionary.USER_NOT_FOUND.code });
  });

  it('Scenario: Refresh exitoso — retorna nuevo par y rota el token', async () => {
    mocks.refreshTokenRepo.findById.mockResolvedValue(buildValidToken());
    mocks.userRepo.findByEmail.mockResolvedValue(buildUser());
    mocks.refreshTokenRepo.rotate.mockResolvedValue();

    const result = await service.refresh('tok-001');

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe('tok-001');
    expect(mocks.refreshTokenRepo.rotate).toHaveBeenCalledWith('tok-001', expect.any(RefreshTokenEntity));
  });
});

// ─── Feature: Logout ──────────────────────────────────────────────────────────

describe('Feature: Cierre de sesión', () => {
  let mocks: Mocks;
  let service: AuthService;
  let jwtSvc: JwtService;

  beforeEach(() => {
    mocks = buildMocks();
    jwtSvc = new JwtService(jwtConfig);
    service = buildService(mocks, jwtSvc);
  });

  it('Scenario: Logout exitoso — revoca, blacklistea y retorna mensaje', async () => {
    const { accessToken } = jwtSvc.signToken(buildUser());
    mocks.refreshTokenRepo.revoke.mockResolvedValue();
    mocks.blacklistRepo.add.mockResolvedValue();

    const result = await service.logout('tok-001', accessToken);

    expect(mocks.refreshTokenRepo.revoke).toHaveBeenCalledWith('tok-001');
    expect(mocks.blacklistRepo.add).toHaveBeenCalledWith(expect.any(String), expect.any(Number));
    expect(result.message).toBe('Sesión cerrada correctamente');
  });
});
