import { Module } from '@nestjs/common';
import { CategoriaEntity } from './entity/categoria.entyty';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformDto } from '@/shared/utils';
import { CategoriaRepository } from './repository/categoria.repository';
import { CategoriaInterfaceRepository } from './repository/categoria.interface.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaEntity])],
  providers: [
    {
      provide: CategoriaInterfaceRepository,
      useClass: CategoriaRepository,
    },

    TransformDto,
  ],
})
export class CategoriasModule {}
