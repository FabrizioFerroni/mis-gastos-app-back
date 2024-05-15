import { Module } from '@nestjs/common';
import { StatusController } from './controller/status.controller';
import { StatusService } from './service/status.service';
import { UsuarioModule } from './usuario/usuario.module';
import { CuentasModule } from './cuentas/cuentas.module';

@Module({
  imports: [CuentasModule, UsuarioModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [CuentasModule, UsuarioModule],
})
export class ApiModule {}
