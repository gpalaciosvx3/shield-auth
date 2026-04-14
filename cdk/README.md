# Shield Auth — CDK

Infraestructura AWS del proyecto `Shield Auth`, definida con AWS CDK (TypeScript).

---

## Índice

- [Estructura](#estructura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Desarrollo en LocalStack](#desarrollo-en-localstack)
- [Despliegue en AWS](#despliegue-en-aws)
- [Comandos de referencia](#comandos-de-referencia)
- [Stages y configuración](#stages-y-configuración)
- [Recursos desplegados](#recursos-desplegados)
- [Outputs del stack](#outputs-del-stack)

---

## Estructura

```
cdk/
  bin/
    app.ts              # Entry point — resuelve stage → config → stack
  lib/
    app.stack.ts        # Stack principal
    constructs/
      api-gateway/      # REST API v1 con rutas auth
      cloudwatch/       # Log groups por Lambda
      dynamodb/         # Tablas Users y RefreshTokens
      elasticache/      # Cluster Redis (blacklist + rate-limit)
      iam/              # Rol de ejecución compartido
      lambda/
        auth/           # Lambda auth-service (login / refresh / logout)
        authorizer/     # Lambda Authorizer (validación JWT + blacklist)
        shared/         # bundling.config.ts compartido
      vpc/              # VPC con subnets privadas + VPC Endpoints
  common/
    constants/          # NamingConstants, ResourceConstants, InfraConstants
    stages/             # local.stage.ts, dev.stage.ts
    types/              # StageConfig
  docker-compose.yml    # LocalStack Pro para desarrollo local
```

---

## Requisitos

- Node.js 20+
- Docker (para LocalStack)
- `LOCALSTACK_AUTH_TOKEN` en `.env` (LocalStack Pro)

---

## Instalación

```bash
# Instalar dependencias CDK
cd cdk && npm install

# Instalar CLI global (una sola vez)
npm install -g aws-cdk aws-cdk-local
pip install awscli-local
```

---

## Desarrollo en LocalStack

> Copiar `.env.example` a `.env` y completar `LOCALSTACK_AUTH_TOKEN`.

```bash
# Levantar LocalStack (desde la raíz del proyecto)
docker compose up -d

# Bootstrap (una vez por contenedor)
cdklocal bootstrap

# Deploy
CDK_STAGE=local cdklocal deploy --require-approval never

# Preview de cambios
CDK_STAGE=local cdklocal diff

# Destruir
cdklocal destroy --force
```

### Scripts disponibles

```bash
npm run setup:local      # bootstrap + deploy
npm run deploy:local     # solo deploy
npm run diff:local       # diff
npm run destroy:local    # destruir stack
```

---

## Despliegue en AWS

```bash
# Bootstrap (una vez por cuenta/región)
CDK_STAGE=dev cdk bootstrap aws://<ACCOUNT_ID>/us-east-1

# Preview
CDK_STAGE=dev cdk diff

# Deploy
CDK_STAGE=dev cdk deploy --require-approval never
```

### Scripts disponibles

```bash
npm run deploy:dev       # deploy a AWS DEV
npm run diff:dev         # diff en AWS DEV
```

---

## Comandos de referencia

### Verificar recursos en LocalStack

```bash
# API Gateway
awslocal apigateway get-rest-apis
awslocal apigateway get-stages --rest-api-id <api-id>

# Lambda
awslocal lambda list-functions --query 'Functions[*].FunctionName'

# DynamoDB
awslocal dynamodb list-tables

# ElastiCache
awslocal elasticache describe-cache-clusters
```

---

## Stages y configuración

| Stage | Branch | Cuenta |
|---|---|---|
| `local` | `local` | `000000000000` (LocalStack) |
| `dev` | `develop` | `CDK_DEFAULT_ACCOUNT` |
| `qa` | `release` | pendiente |
| `prd` | `master` | pendiente |

El stage se controla con la variable de entorno `CDK_STAGE`:

```bash
CDK_STAGE=dev cdk deploy ...
```

Para agregar un nuevo stage: crear `cdk/common/stages/qa.stage.ts` y extender el `switch` en `bin/app.ts`.

---

## Recursos desplegados

| Recurso | Construct | Nombre físico |
|---|---|---|
| Lambda auth-service | `AuthFnConstruct` | `UE1SHIELDAUTHLMB001` |
| Lambda Authorizer | `AuthorizerFnConstruct` | `UE1SHIELDAUTHLMB002` |
| API Gateway REST | `HttpApiConstruct` | `UE1SHIELDAUTHGTW001` |
| IAM Role | `WorkerRoleConstruct` | `UE1SHIELDAUTHROL001` |
| VPC | `ShieldVpcConstruct` | `UE1SHIELDAUTHVPC001` |
| Security Group Redis | `RedisClusterConstruct` | `UE1SHIELDAUTHSGP001` |
| Security Group Lambda | `ShieldVpcConstruct` | `UE1SHIELDAUTHSGP002` |
| ElastiCache Redis | `RedisClusterConstruct` | `UE1SHIELDAUTHECC001` |
| DynamoDB Users | `AuthTablesConstruct` | `UE1SHIELDAUTHDDB001` |
| DynamoDB RefreshTokens | `AuthTablesConstruct` | `UE1SHIELDAUTHDDB002` |

### Rutas expuestas

| Método | Ruta | Autorización |
|---|---|---|
| `POST` | `/v1/auth/login` | Ninguna |
| `POST` | `/v1/auth/refresh` | Ninguna |
| `POST` | `/v1/auth/logout` | Ninguna |

---

## Outputs del stack

| Output | Descripción |
|---|---|
| `ApiUrl` | URL base del API Gateway |
| `AuthorizerFunctionArn` | ARN del Lambda Authorizer — exportado como `shield-auth-authorizer-arn-{stage}` para uso en otros API Gateways |
