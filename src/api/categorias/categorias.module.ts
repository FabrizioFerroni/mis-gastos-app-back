import { Module } from '@nestjs/common';
import { CategoriaEntity } from './entity/categoria.entyty';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformDto } from '@/shared/utils';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaEntity])],
  providers: [TransformDto],
})
export class CategoriasModule {}
