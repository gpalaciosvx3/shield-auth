import { Injectable } from '@nestjs/common';
import { PingService } from '../../domain/service/ping.service';
import { PingResult } from '../../domain/types/ping-result.type';

@Injectable()
export class PingUseCase {
  constructor(private readonly pingService: PingService) {}

  execute(): Promise<PingResult> {
    return this.pingService.check();
  }
}
