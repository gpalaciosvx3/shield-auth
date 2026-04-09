import { Injectable } from '@nestjs/common';
import { PingRepository } from '../repository/ping.repository';
import { PingResult } from '../types/ping-result.type';

@Injectable()
export class PingService {
  constructor(private readonly pingRepository: PingRepository) {}

  check(): Promise<PingResult> {
    return this.pingRepository.check();
  }
}
