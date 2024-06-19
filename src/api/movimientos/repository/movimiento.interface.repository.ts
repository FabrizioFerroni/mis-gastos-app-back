import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UpdateResult } from 'typeorm';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { MovimientoEntity } from '../entity/movimientos.entity';

@Injectable()
export abstract class MovimientoInterfaceRepository extends BaseAbstractRepository<MovimientoEntity> {
  abstract guardar(data: MovimientoEntity): Promise<MovimientoEntity>;
  abstract obtenerTodosAndCount(
    skip?: number,
    take?: number,
  ): Promise<[MovimientoEntity[], number]>;
  abstract obtenerTodosPorUsuario(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<[MovimientoEntity[], number]>;
  abstract obtenerPorId(id: string): Promise<MovimientoEntity>;
  abstract borrar(id: string): Promise<UpdateResult>;
  abstract actualizar(
    id: string,
    data: MovimientoEntity,
  ): Promise<UpdateResult>;
  abstract obtenerRelaciones(): Promise<MovimientoEntity[]>;
  abstract existeRegistro(id: string, deleted?: boolean): Promise<boolean>;
  abstract restaurar(id: string): Promise<UpdateResult>;
}
