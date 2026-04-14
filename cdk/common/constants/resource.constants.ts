import { NamingConstants } from './naming.constants';

export class ResourceConstants {
  static readonly LAMBDA_AUTH       = NamingConstants.LMB_001;
  static readonly LAMBDA_AUTHORIZER = NamingConstants.LMB_002;

  static readonly API_NAME    = NamingConstants.APG_001;
  static readonly WORKER_ROLE = NamingConstants.ROL_001;

  static readonly VPC = NamingConstants.VPC_001;

  static readonly REDIS_CLUSTER = NamingConstants.ECC_001;
  static readonly REDIS_SG      = NamingConstants.SGP_001;
  static readonly LAMBDA_SG     = NamingConstants.SGP_002;

  static readonly TABLE_USERS          = NamingConstants.DDB_001;
  static readonly TABLE_REFRESH_TOKENS = NamingConstants.DDB_002;
}
