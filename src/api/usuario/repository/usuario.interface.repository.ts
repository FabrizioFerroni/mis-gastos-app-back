import { Injectable } from '@nestjs/common';
import { UsuarioEntity } from '../entity/usuario.entity';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UpdateResult } from 'typeorm';

@Injectable()
export abstract class UsuarioInterfaceRepository extends BaseAbstractRepository<UsuarioEntity> {
  abstract guardar(data: UsuarioEntity): Promise<UsuarioEntity>;
  abstract obtenerTodos(): Promise<UsuarioEntity[]>;
  abstract obtenerPorId(id: string): Promise<UsuarioEntity>;
  abstract borrar(id: string): Promise<UpdateResult>;
  abstract actualizar(id: string, fake: UsuarioEntity): Promise<UsuarioEntity>;
  abstract obtenerRelaciones(): Promise<UsuarioEntity[]>;
  abstract usuarioYaExiste(email: string, id?: string): Promise<boolean>;
}
