import { Health } from '@/types/health.type';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatusService } from '../service/status.service';

@Controller('estado')
@ApiTags('Estado')
@ApiExcludeController()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Estado del servicio' })
  getStatus(): Health {
    return this.statusService.getAvailability();
  }
}
