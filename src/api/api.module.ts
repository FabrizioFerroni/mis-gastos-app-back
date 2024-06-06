import { Module } from '@nestjs/common';
import { StatusController } from './controller/status.controller';
import { StatusService } from './service/status.service';
import { CategoriasModule } from './categorias/categorias.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [CategoriasModule, CuentasModule, UsuarioModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [CategoriasModule, CuentasModule, UsuarioModule],
})
export class ApiModule {}
