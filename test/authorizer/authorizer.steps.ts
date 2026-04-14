import { Logger } from '@nestjs/common';
import { AuthorizerService } from '../../src/authorizer/domain/service/authorizer.service';
import { JwtVerifierService } from '../../src/authorizer/domain/service/jwt-verifier.service';
import { BlacklistCacheRepository } from '../../src/authorizer/domain/repository/blacklist.cache.repository';
import { AuthorizeUseCase } from '../../src/authorizer/application/use-cases/authorize.usecase';
import { JwtPayload } from '../../src/authorizer/domain/types/jwt-payload.types';
import { ErrorDictionary } from '../../src/common/errors/error.dictionary';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

// ─── Fixtures ────────────────────────────────────────────────────────────────

const buildPayload = (jti = 'jti-valid'): JwtPayload => ({
  sub: 'usr-001',
  email: 'user@test.com',
  jti,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900,
});

// ─── Feature: AuthorizerService — authorize ───────────────────────────────────

describe('Feature: AuthorizerService — authorize', () => {
  let jwtVerifier: { decode: jest.MockedFunction<(token: string) => JwtPayload> };
  let blacklistRepo: { exists: jest.MockedFunction<(jti: string) => Promise<boolean>> };
  let service: AuthorizerService;

  beforeEach(() => {
    jwtVerifier = { decode: jest.fn<JwtPayload, [string]>() };
    blacklistRepo = { exists: jest.fn<Promise<boolean>, [string]>() };
    service = new AuthorizerService(
      jwtVerifier as unknown as JwtVerifierService,
      blacklistRepo as unknown as BlacklistCacheRepository,
    );
  });

  it.each<[string, string, string | undefined]>([
    ['sin prefijo Bearer', 'InvalidTokenWithoutBearer', undefined],
    ['vacío', '', undefined],
    ['con jti en blacklist', 'Bearer valid-token', 'jti-blacklisted'],
  ])('Esquema: Autorización rechazada — %s', async (_, rawAuth, jtiEnBlacklist) => {
    if (jtiEnBlacklist) {
      jwtVerifier.decode.mockReturnValue(buildPayload(jtiEnBlacklist));
      blacklistRepo.exists.mockResolvedValue(true);
    }

    await expect(service.authorize(rawAuth))
      .rejects.toMatchObject({ code: ErrorDictionary.REFRESH_TOKEN_INVALID.code });

    if (jtiEnBlacklist) {
      expect(blacklistRepo.exists).toHaveBeenCalledWith(jtiEnBlacklist);
    }
  });

  it('Scenario: Autorización concedida — retorna payload con sub, email y jti', async () => {
    const payload = buildPayload('jti-valid');
    jwtVerifier.decode.mockReturnValue(payload);
    blacklistRepo.exists.mockResolvedValue(false);

    const result = await service.authorize('Bearer valid-token');

    expect(result.sub).toBe('usr-001');
    expect(result.email).toBe('user@test.com');
    expect(result.jti).toBe('jti-valid');
  });

});

// ─── Feature: AuthorizeUseCase ────────────────────────────────────────────────

describe('Feature: AuthorizeUseCase', () => {
  let authorizerServiceMock: { authorize: jest.MockedFunction<(rawAuth: string) => Promise<JwtPayload>> };
  let useCase: AuthorizeUseCase;

  beforeEach(() => {
    authorizerServiceMock = { authorize: jest.fn<Promise<JwtPayload>, [string]>().mockResolvedValue(buildPayload()) };
    useCase = new AuthorizeUseCase(authorizerServiceMock as unknown as AuthorizerService);
  });

  it.each<[string, Record<string, string>, string]>([
    ['Authorization en mayúsculas', { Authorization: 'Bearer token-value' }, 'Bearer token-value'],
    ['authorization en minúsculas', { authorization: 'Bearer token-value' }, 'Bearer token-value'],
    ['headers vacíos', {}, ''],
  ])('Esquema: Header resuelto — %s', async (_, headers, rawAuthEsperado) => {
    await useCase.execute(headers);

    expect(authorizerServiceMock.authorize).toHaveBeenCalledWith(rawAuthEsperado);
  });

  it('Scenario: Authorization tiene prioridad sobre authorization (minúsculas)', async () => {
    await useCase.execute({ Authorization: 'Bearer upper', authorization: 'Bearer lower' });

    expect(authorizerServiceMock.authorize).toHaveBeenCalledWith('Bearer upper');
  });
});
