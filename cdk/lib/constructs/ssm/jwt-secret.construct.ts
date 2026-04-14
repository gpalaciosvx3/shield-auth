import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface JwtSecretProps {
  stage: string;
  value: string;
}

export class JwtSecretConstruct extends Construct {
  readonly param: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: JwtSecretProps) {
    super(scope, id);

    this.param = new ssm.StringParameter(this, 'Param', {
      parameterName: `/shield-auth/${props.stage}/jwt-secret`,
      stringValue: props.value,
      description: 'JWT firma secreta para shield-auth',
    });
  }
}
