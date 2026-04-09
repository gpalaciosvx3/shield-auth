# shield-auth — Reglas arquitectónicas establecidas en sesión

## Clean Architecture — reglas de capas

- `domain/` nunca importa de `infrastructure/` ni de `common/config/`. Solo conoce sus propias entidades, interfaces y tipos.
- `envConfig` solo se lee en el módulo (`bootstrap/*.module.ts`) y se inyecta como config tipada por constructor.
- Interfaces de configuración de servicios viven en `domain/types/` — nunca inline dentro del servicio.
- Los repositorios de infraestructura solo se comunican con el exterior (Redis, DynamoDB) — **sin lógica de negocio, sin transformaciones, sin condicionales**.
- La lógica de negocio (ej: `count >= maxAttempts`) vive exclusivamente en `domain/service/`.
- Guards y filtros globales viven en `common/guards/` y `common/filters/` — nunca dentro de un módulo de feature.

## Entidades de dominio

- **`private constructor` siempre** — las entidades no se instancian directamente desde fuera.
- **`static build(params)`** — único factory para crear entidades nuevas; delega a `validateInvariants` antes de construir.
- **`private static validateInvariants(params)`** — protege los invariantes del dominio usando el patrón `rules` array:
  ```typescript
  const rules: Array<[boolean, InputError]> = [ [condicion, ErrorDictionary.ERROR] ];
  rules.filter(([failed]) => failed).slice(0, 1).forEach(([, error]) => { throw new CustomException(error); });
  ```
- **Sin `static fromPersistence()`** — los repositorios usan el tipo de entidad directamente como genérico de `dynamo.get<Entity>` / `dynamo.query<Entity>`. El ORM/client devuelve la shape, no hay reconstrucción manual.
- La entidad contiene lógica de negocio propia: generación de ID, timestamps, TTL, métodos de estado (`isExpired()`, `verifyPassword()`). Ninguno de esos cálculos vive en el servicio.

## Servicios de dominio

- Un método público con más de ~15 líneas debe descomponerse en privados con responsabilidad única.
- Si un servicio tiene una responsabilidad claramente separable (ej: generación de JWT), se extrae a su propio servicio de dominio.
- Métodos `assert*` que validan y garantizan un tipo non-null **devuelven la entidad** (`RefreshTokenEntity`, no `void`) para eliminar `!` non-null assertions en el caller.
- Cadenas de `if/throw` se reemplazan por el patrón `rules` array  — mismo que `validateInvariants`.
- Cuando se busca un recurso que podría no existir y su ausencia es una inconsistencia de datos, se extrae en un método privado `resolve*` con error específico (no `INTERNAL_ERROR` genérico).
- `Logger` siempre declarado como `private readonly logger = new Logger(ClassName.name)`.
- Logs en español, formato: `Acción => campo: valor | campo: valor`.

## Repositorios de infraestructura

- Transparentes: `return this.dynamo.get<Entity>(table, key)` — sin variables intermedias, sin condicionales, sin `fromPersistence`.
- El genérico del client es siempre la **clase de entidad de dominio**, no un tipo inline ni una interface nombrada.

## Constantes y tokens

- **Prohibido `export const TOKEN = 'value'`** como constante suelta en archivos — toda constante vive dentro de una clase (`HttpConstants`, `RedisConstants`, `EnvConstants`).
- Keys de Redis → `RedisConstants` como static functions.
- Tokens HTTP (ej: nombre de campo en request) → `HttpConstants` como static readonly.

## DTOs

- Usar `declare` en lugar de `!` para propiedades de DTOs.
- Las clases DTO implementan la entidad de dominio correspondiente con `implements` para garantizar sincronía.

## Redis

- Todas las operaciones Redis se envuelven con `withRedisBreaker()` — nunca llamar `redisClient` directo.
- Números de configuración del cliente Redis (timeouts, thresholds) viven en `RedisConstants`, no inline.

## Módulo (bootstrap)

- `envConfig` es el único punto de entrada de variables de entorno — se lee una vez en el módulo y se pasa hacia abajo.
- El módulo es el único lugar donde se construyen los objetos de config (`AuthServiceConfig`, `JwtServiceConfig`).
- Controllers en `controllers[]`, nunca en `providers[]`.

## Misc

- Sin `any` en TypeScript — siempre tipado explícito.
- Sin `interface NombreConcreto {}` declaraciones nombradas — usar tipos inline o clases.
- Sin try/catch fuera del filter global (`HttpExceptionFilter`).
- Sin comentarios inline en el código.
