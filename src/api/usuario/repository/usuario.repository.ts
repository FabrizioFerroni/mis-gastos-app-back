/* eslint-disable @typescript-eslint/no-unused-vars */

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, UpdateResult } from 'typeorm';
import { UsuarioEntity } from '../entity/usuario.entity';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UsuarioInterfaceRepository } from './usuario.interface.repository';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class UsuarioRepository
  extends BaseAbstractRepository<UsuarioEntity>
  implements UsuarioInterfaceRepository
{
  constructor(
    @InjectRepository(UsuarioEntity)
    public repository: Repository<UsuarioEntity>,
  ) {
    super(repository);
  }

  async guardar(data: UsuarioEntity): Promise<UsuarioEntity> {
    const create: UsuarioEntity = this.create(data);
    const userSaved: UsuarioEntity = await this.save(create);

    if (!userSaved)
      throw new BadRequestException('No se pudo crear el usuario');

    return userSaved;
  }

  async obtenerTodos(): Promise<UsuarioEntity[]> {
    return await this.findAll();
  }

  async obtenerPorId(id: string): Promise<UsuarioEntity> {
    return await this.findOneById(id);
  }

  async borrar(id: string): Promise<UpdateResult> {
    return await this.softDelete(id);
  }

  actualizar(id: string, fake: UsuarioEntity): Promise<UsuarioEntity> {
    throw new Error('Method not implemented.');
  }

  async obtenerRelaciones(): Promise<UsuarioEntity[]> {
    const options = {
      relations: {},
    };
    return await this.findWithRelations(options);
  }

  async usuarioYaExiste(email: string, id?: string): Promise<boolean> {
    let result: UsuarioEntity;

    if (!id) {
      const options = {
        where: {
          email: String(email),
        },
      };

      result = await this.findByCondition(options);
    } else {
      const options = {
        where: {
          email: String(email),
          id: Not(id),
        },
      };

      result = await this.findByCondition(options);
    }

    return !!result;
  }
}
