# {{project-name}}

{{project-description}}

---

## Índice

- [Arquitectura](#arquitectura)
- [API Reference](#api-reference)
  - [Endpoints](#endpoints)
  - [Códigos de error](#códigos-de-error)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
- [CI/CD](#cicd)
  - [Pipelines](#pipelines)
  - [Secretos requeridos](#secretos-requeridos)

---

## Arquitectura

> Agrega tu diagrama: `docs/architecture.png`
<!-- ![Arquitectura](./docs/architecture.png) -->

### Recursos AWS

| Recurso | Nombre | Descripción |
|---|---|---|
| API Gateway REST | `UE1{{PROJECT}}GTW001` | Entry point HTTP con API Key + Usage Plan |
| Lambda `ping` | `UE1{{PROJECT}}LMB001` | Health check |
| IAM Role | `UE1{{PROJECT}}ROL001` | Rol de ejecución compartido |

---

## API Reference

Todas las rutas requieren el header `x-api-key`.

### Endpoints

#### GET `/v1/ping`

Health check del servicio.

**Response `200`:**
```json
{
  "data": {
    "message": "pong",
    "timestamp": "2026-04-08T12:00:00.000Z"
  }
}
```

---

### Códigos de error

```json
{ "code": "APP-001", "description": "Ocurrió un error inesperado" }
```

| Código | HTTP | Descripción |
|---|---|---|
| `APP-001` | 500 | Error inesperado |
| `APP-002` | 500 | Variable de entorno faltante |
| `APP-003` | 400 | Body de request inválido |


---

## Instalación y desarrollo local

```bash
# Instalar dependencias
npm install

# Tests unitarios
npm test
```

---

## Desarrollo en LocalStack

> Copiar `.env.example` a `.env` y completar `LOCALSTACK_AUTH_TOKEN`.

```bash
# Levantar LocalStack
docker compose up -d

# Instalar CLI (una sola vez)
npm install -g aws-cdk aws-cdk-local
pip install awscli-local

# Bootstrap + deploy
cd cdk
cdklocal bootstrap
CDK_STAGE=local cdklocal deploy --require-approval never
```

---

## Despliegue en AWS

```bash
# Bootstrap (una vez por cuenta/región)
cdk bootstrap aws://<ACCOUNT_ID>/us-east-1

# Preview de cambios
CDK_STAGE=dev cdk diff

# Deploy
CDK_STAGE=dev cdk deploy --require-approval never

# Destruir el stack
CDK_STAGE=dev cdk destroy
```

> URL del endpoint: `https://{id}.execute-api.us-east-1.amazonaws.com/{stage}/v1/{path}`

---

## CI/CD

### Pipelines

| Archivo | Trigger | Acción |
|---|---|---|
| `local.yml` | `push` a `local` | Deploy en LocalStack |
| `dev.yml` | `push` a `develop` | Deploy en AWS DEV |
| `qa.yml` | `push` a `release` | Deploy en AWS QA |
| `prd.yml` | `push` a `master` | Deploy en AWS PRD |
| `destroy.yml` | Manual (`workflow_dispatch`) | Destruye el stack del stage seleccionado |

### Secretos requeridos

Configurar en GitHub → Settings → Environments:

**`deployer-dev` / `deployer-qa` / `deployer-prd`:**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
CDK_DEFAULT_ACCOUNT
AWS_DEFAULT_REGION
```

**`deployer-local`:**
```
LOCALSTACK_AUTH_TOKEN
```

---