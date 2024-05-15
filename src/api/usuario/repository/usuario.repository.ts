/* eslint-disable @typescript-eslint/no-unused-vars */

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { UsuarioEntity } from '../entity/usuario.entity';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UsuarioInterfaceRepository } from './usuario.interface.repository';
import { plainToInstance } from 'class-transformer';
import { BadRequestException, Inject } from '@nestjs/common';
import { TransformDto } from '@/shared/utils';
import { ResponseUsuarioDto } from '../dto/response/response.user.dto';

export class UsuarioRepository
  extends BaseAbstractRepository<UsuarioEntity>
  implements UsuarioInterfaceRepository
{
  constructor(
    @InjectRepository(UsuarioEntity)
    public repository: Repository<UsuarioEntity>,
    @Inject(TransformDto)
    private readonly transform: TransformDto<UsuarioEntity, ResponseUsuarioDto>,
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

  async obtenerTodos(
    deletedAt: boolean,
    skip?: number,
    take?: number,
  ): Promise<UsuarioEntity[]> {
    const options = {
      withDeleted: deletedAt,
      skip: skip || 0,
      take: take || 0,
      relations: {
        cuentas: true,
      },
    };

    //TODO: Ver porque el withDeleted no funciona en esta funcion.

    return await this.findAll(options);
  }

  async obtenerPorId(id: string): Promise<UsuarioEntity> {
    return await this.findOneById(id);
  }

  async borrar(id: string): Promise<UpdateResult> {
    return await this.softDelete(id);
  }

  async actualizar(id: string, data: UsuarioEntity): Promise<UpdateResult> {
    return await this.update(id, data);
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

  async existeReg(id: string, deleted?: boolean) {
    const options = {
      where: {
        id: id,
      },
      withDeleted: deleted,
    };

    return await this.exists(options);
  }

  async restaurar(id: string) {
    return await this.restore(id);
  }
}
