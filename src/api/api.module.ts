import { Module } from '@nestjs/common';
import { StatusController } from './controller/status.controller';
import { StatusService } from './service/status.service';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
  imports: [UsuarioModule],
})
export class ApiModule {}
