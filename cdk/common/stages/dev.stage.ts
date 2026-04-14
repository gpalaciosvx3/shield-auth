import { StageConfig } from '../types/stage-config.types';

export const DevStage: StageConfig = {
  stage: 'dev',
  account: process.env.CDK_DEFAULT_ACCOUNT || '000000000000',
  region:  process.env.CDK_DEFAULT_REGION  ?? 'us-east-1',
  jwtSecret: process.env.JWT_SECRET ?? 'REPLACE_ME_IN_ENV',
};
