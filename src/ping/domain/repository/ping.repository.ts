import { PingResult } from '../types/ping-result.type';

export abstract class PingRepository {
  abstract check(): Promise<PingResult>;
}
