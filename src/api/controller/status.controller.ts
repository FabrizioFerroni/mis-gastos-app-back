import { Health } from '@/types/health.type';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatusService } from '../service/status.service';

@Controller('estado')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Service status' })
  getStatus(): Health {
    return this.statusService.getAvailability();
  }
}