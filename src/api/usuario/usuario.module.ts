import { Module } from '@nestjs/common';
import { UsuarioEntity } from './entity/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioController } from './controller/usuario.controller';
import { UsuarioService } from './service/usuario.service';
import { UsuarioRepository } from './repository/usuario.repository';
import { TransformDto } from '@/shared/utils';
import { UsuarioInterfaceRepository } from './repository/usuario.interface.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity])],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    {
      provide: UsuarioInterfaceRepository,
      useClass: UsuarioRepository,
    },
    TransformDto,
  ],
  exports: [UsuarioService],
})
export class UsuarioModule {}
