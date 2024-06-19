import { CoreModule } from '@/core/core.module';
import { Module } from '@nestjs/common';
import { UsuarioModule } from '../usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoEntity } from './entity/movimientos.entity';
import { TransformDto } from '@/shared/utils';

@Module({
  controllers: [],
  imports: [
    TypeOrmModule.forFeature([MovimientoEntity]),
    UsuarioModule,
    CoreModule,
  ],
  providers: [TransformDto],
  exports: [],
})
export class MovimientosModule {}
