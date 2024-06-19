import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UpdateResult } from 'typeorm';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { CategoriaEntity } from '../entity/categoria.entyty';

@Injectable()
export abstract class CategoriaInterfaceRepository extends BaseAbstractRepository<CategoriaEntity> {
  abstract guardar(data: CategoriaEntity): Promise<CategoriaEntity>;
  abstract obtenerTodos(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<[CategoriaEntity[], number]>;
  abstract obtenerPorId(id: string): Promise<CategoriaEntity>;
  abstract obtenerPorIdRel(id: string): Promise<CategoriaEntity>;
  abstract borrar(id: string): Promise<UpdateResult>;
  abstract actualizar(id: string, data: CategoriaEntity): Promise<UpdateResult>;
  abstract obtenerRelaciones(): Promise<CategoriaEntity[]>;
  abstract categoriaYaExiste(
    nombre: string,
    id?: string,
    usuario?: UsuarioEntity,
  ): Promise<boolean>;
  abstract existeRegistro(id: string, deleted?: boolean): Promise<boolean>;
  abstract restaurar(id: string): Promise<UpdateResult>;
}
