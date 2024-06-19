import { Module } from '@nestjs/common';
import { StatusController } from './controller/status.controller';
import { StatusService } from './service/status.service';
import { CategoriasModule } from './categorias/categorias.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { UsuarioModule } from './usuario/usuario.module';
import { MovimientosModule } from './movimientos/movimientos.module';

@Module({
  imports: [CategoriasModule, CuentasModule, UsuarioModule, MovimientosModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [CategoriasModule, CuentasModule, UsuarioModule],
})
export class ApiModule {}
