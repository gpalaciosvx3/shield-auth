export class AuthorizerConstants {
  static readonly POLICY_VERSION = '2012-10-17';
  static readonly POLICY_ACTION = 'execute-api:Invoke';
  static readonly PRINCIPAL_ID = 'user';
  static readonly EFFECT_ALLOW = 'Allow' as const;
  static readonly EFFECT_DENY = 'Deny' as const;
}
