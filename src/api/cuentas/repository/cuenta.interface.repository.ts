import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UpdateResult } from 'typeorm';
import { CuentaEntity } from '../entity/cuenta.entity';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';

@Injectable()
export abstract class CuentaInterfaceRepository extends BaseAbstractRepository<CuentaEntity> {
  abstract guardar(data: CuentaEntity): Promise<CuentaEntity>;
  abstract obtenerTodos(skip?: number, take?: number): Promise<CuentaEntity[]>;
  abstract obtenerTodosAndCount(
    skip?: number,
    take?: number,
  ): Promise<[CuentaEntity[], number]>;
  abstract obtenerTodosPorUsuario(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<[CuentaEntity[], number]>;
  abstract obtenerPorId(id: string): Promise<CuentaEntity>;
  abstract borrar(id: string): Promise<UpdateResult>;
  abstract actualizar(id: string, data: CuentaEntity): Promise<UpdateResult>;
  abstract obtenerRelaciones(): Promise<CuentaEntity[]>;
  abstract cuentaYaExiste(
    nombre: string,
    id?: string,
    usuario?: UsuarioEntity,
  ): Promise<boolean>;
  abstract nroCuentaYaExiste(
    nroCuenta: string,
    id?: string,
    usuario?: UsuarioEntity,
  ): Promise<boolean>;
  abstract existeRegistro(id: string, deleted?: boolean): Promise<boolean>;
  abstract restaurar(id: string): Promise<UpdateResult>;
}
