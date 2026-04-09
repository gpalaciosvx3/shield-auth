import { Injectable } from '@nestjs/common';
import { PingRepository } from '../../domain/repository/ping.repository';
import { PingResult } from '../../domain/types/ping-result.type';

@Injectable()
export class PingRepositoryImpl extends PingRepository {
  check(): Promise<PingResult> {
    return Promise.resolve({
      message: 'pong',
      timestamp: new Date().toISOString(),
    });
  }
}
