import { Module } from '@nestjs/common';
import { CuentaEntity } from './entity/cuenta.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformDto } from '@/shared/utils';
import { CuentaRepository } from './repository/cuenta.repository';
import { CuentaInterfaceRepository } from './repository/cuenta.interface.repository';
import { CuentaService } from './service/cuenta.service';
import { CuentaController } from './controller/cuenta.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaEntity]),
    UsuarioModule,
    CoreModule,
  ],
  controllers: [CuentaController],
  providers: [
    CuentaService,
    {
      provide: CuentaInterfaceRepository,
      useClass: CuentaRepository,
    },
    TransformDto,
    CuentaService,
  ],
  exports: [],
})
export class CuentasModule {}
