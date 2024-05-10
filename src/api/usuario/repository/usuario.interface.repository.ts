import { Injectable } from '@nestjs/common';
import { UsuarioEntity } from '../entity/usuario.entity';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UpdateResult } from 'typeorm';

@Injectable()
export abstract class UsuarioInterfaceRepository extends BaseAbstractRepository<UsuarioEntity> {
  abstract guardar(data: UsuarioEntity): Promise<UsuarioEntity>;
  abstract obtenerTodos(
    deletedAt: boolean,
    skip?: number,
    take?: number,
  ): Promise<UsuarioEntity[]>;
  abstract obtenerPorId(id: string, deleted?: boolean): Promise<UsuarioEntity>;
  abstract borrar(id: string): Promise<UpdateResult>;
  abstract actualizar(id: string, data: UsuarioEntity): Promise<UpdateResult>;
  abstract obtenerRelaciones(): Promise<UsuarioEntity[]>;
  abstract usuarioYaExiste(email: string, id?: string): Promise<boolean>;
  abstract existeReg(id: string, deleted?: boolean): Promise<boolean>;
  abstract restaurar(id: string): Promise<UpdateResult>;
}
