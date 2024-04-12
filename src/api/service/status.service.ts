import { Health, HealthStatus } from '@/types/health.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  getAvailability(): Health {
    console.log('Test linter');

    return { status: HealthStatus.AVAILABLE };
  }
}
