import { Health, HealthStatus } from '@/types/health.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  getAvailability(): Health {
    return { status: HealthStatus.AVAILABLE };
  }
}
