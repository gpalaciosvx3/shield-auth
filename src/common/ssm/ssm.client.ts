import { Injectable } from '@nestjs/common';
import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { ssmSdkClient } from '../config/aws.config';
import { awsError } from '../errors/aws-error.mapper';
import { CustomException } from '../errors/custom.exception';
import { ErrorDictionary } from '../errors/error.dictionary';

@Injectable()
export class SsmClient {
  async getParameter(name: string, withDecryption = true): Promise<string> {
    return awsError(async () => {
      const result = await ssmSdkClient.send(
        new GetParameterCommand({ Name: name, WithDecryption: withDecryption }),
      );
      const value = result.Parameter?.Value;
      if (!value) throw new CustomException(ErrorDictionary.SSM_PARAMETER_NOT_FOUND, name);
      return value;
    }, ErrorDictionary.SSM_PARAMETER_NOT_FOUND);
  }
}
