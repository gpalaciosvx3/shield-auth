# {{project-name}} — CDK

Infraestructura AWS del proyecto `{{project-name}}`, definida con AWS CDK (TypeScript).

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

---

## Estructura

```
cdk/
  bin/
    app.ts              # Entry point — resuelve stage → config → stack
  lib/
    app.stack.ts        # Stack principal
    constructs/
      api-gateway/      # REST API v1, API Key, Usage Plan
      cloudwatch/       # Log groups por Lambda
      iam/              # Rol de ejecución compartido
      lambda/           # Una construct por función Lambda
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

| Recurso | Nombre lógico | Nombre físico |
|---|---|---|
| Lambda Ping | `PingFn` | `UE1{{PROJECT}}LMB001` |
| API Gateway REST | `HttpApi` | `UE1{{PROJECT}}GTW001` |
| IAM Role | `WorkerRole` | `UE1{{PROJECT}}ROL001` |
