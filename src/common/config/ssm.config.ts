import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { envConfig } from './env.config';

const ssmClient = new SSMClient({ region: envConfig.awsRegion });

export const getParameter = async (name: string, withDecryption = true): Promise<string> => {
  const result = await ssmClient.send(
    new GetParameterCommand({ Name: name, WithDecryption: withDecryption }),
  );

  const value = result.Parameter?.Value;
  if (!value) throw new Error(`SSM parameter not found: ${name}`);
  return value;
};
