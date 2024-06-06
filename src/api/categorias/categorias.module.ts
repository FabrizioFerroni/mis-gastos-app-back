import { Module } from '@nestjs/common';
import { CategoriaEntity } from './entity/categoria.entyty';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformDto } from '@/shared/utils';
import { CategoriaRepository } from './repository/categoria.repository';
import { CategoriaInterfaceRepository } from './repository/categoria.interface.repository';
import { CategoriaService } from './service/categoria.service';
import { UsuarioModule } from '../usuario/usuario.module';
import { CoreModule } from '@/core/core.module';
import { CategoriaController } from './controller/categoria.controller';

@Module({
  controllers: [CategoriaController],
  imports: [
    TypeOrmModule.forFeature([CategoriaEntity]),
    UsuarioModule,
    CoreModule,
  ],
  providers: [
    CategoriaService,
    {
      provide: CategoriaInterfaceRepository,
      useClass: CategoriaRepository,
    },

    TransformDto,
  ],
  exports: [CategoriaService],
})
export class CategoriasModule {}
