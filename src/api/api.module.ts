import { Module } from '@nestjs/common';
import { StatusController } from './controller/status.controller';
import { StatusService } from './service/status.service';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
})
export class ApiModule {}
