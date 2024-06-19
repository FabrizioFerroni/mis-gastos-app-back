import { CoreModule } from '@/core/core.module';
import { Module } from '@nestjs/common';
import { UsuarioModule } from '../usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoEntity } from './entity/movimientos.entity';
import { TransformDto } from '@/shared/utils';
import { MovimientoInterfaceRepository } from './repository/movimiento.interface.repository';
import { MovimientoRepository } from './repository/movimiento.repository';
import { MovimientosService } from './service/movimientos.service';
import { CuentasModule } from '../cuentas/cuentas.module';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  controllers: [],
  imports: [
    TypeOrmModule.forFeature([MovimientoEntity]),
    UsuarioModule,
    CuentasModule,
    CategoriasModule,
    CoreModule,
  ],
  providers: [
    MovimientosService,
    {
      provide: MovimientoInterfaceRepository,
      useClass: MovimientoRepository,
    },
    TransformDto,
  ],
  exports: [MovimientosService],
})
export class MovimientosModule {}
