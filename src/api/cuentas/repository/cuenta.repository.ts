import { InjectRepository } from '@nestjs/typeorm';
import { CuentaEntity } from '../entity/cuenta.entity';
import { CuentaInterfaceRepository } from './cuenta.interface.repository';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { Not, Repository, UpdateResult } from 'typeorm';
import { TransformDto } from '@/shared/utils';
import { BadRequestException, Inject } from '@nestjs/common';
import { ResponseCuentaDto } from '../dto/response/response.cuenta.dto';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';

export class CuentaRepository
  extends BaseAbstractRepository<CuentaEntity>
  implements CuentaInterfaceRepository
{
  constructor(
    @InjectRepository(CuentaEntity)
    public repository: Repository<CuentaEntity>,
    @Inject(TransformDto)
    private readonly transform: TransformDto<CuentaEntity, ResponseCuentaDto>,
  ) {
    super(repository);
  }

  async obtenerTodos(skip?: number, take?: number): Promise<CuentaEntity[]> {
    const options = {
      skip: skip || 0,
      take: take || 0,
      relations: {
        usuario: true,
      },
    };

    return await this.findAll(options);
  }

  async obtenerTodosPorUsuario(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<CuentaEntity[]> {
    const options = {
      skip: skip || 0,
      take: take || 0,
      where: {
        usuario: usuario,
      },
    };

    return await this.findAll(options);
  }

  async obtenerPorId(id: string): Promise<CuentaEntity> {
    return await this.findOneById(id);
  }

  async guardar(data: CuentaEntity): Promise<CuentaEntity> {
    const create: CuentaEntity = this.create(data);
    const cuentaSaved: CuentaEntity = await this.save(create);

    if (!cuentaSaved)
      throw new BadRequestException('No se pudo crear la cuenta al usuario');

    return cuentaSaved;
  }

  async borrar(id: string): Promise<UpdateResult> {
    return await this.softDelete(id);
  }

  async actualizar(id: string, data: CuentaEntity): Promise<UpdateResult> {
    return await this.update(id, data);
  }

  async obtenerRelaciones(): Promise<CuentaEntity[]> {
    const options = {
      relations: {},
    };
    return await this.findWithRelations(options);
  }

  async cuentaYaExiste(nombre: string, id?: string): Promise<boolean> {
    let result: CuentaEntity;

    if (!id) {
      const options = {
        where: {
          nombre: String(nombre),
        },
      };

      result = await this.findByCondition(options);
    } else {
      const options = {
        where: {
          nombre: String(nombre),
          id: Not(id),
        },
      };

      result = await this.findByCondition(options);
    }

    return !!result;
  }

  async nroCuentaYaExiste(nroCuenta: string, id?: string): Promise<boolean> {
    let result: CuentaEntity;

    if (!id) {
      const options = {
        where: {
          nroCuenta: String(nroCuenta),
        },
      };

      result = await this.findByCondition(options);
    } else {
      const options = {
        where: {
          nroCuenta: String(nroCuenta),
          id: Not(id),
        },
      };

      result = await this.findByCondition(options);
    }

    return !!result;
  }

  async existeRegistro(id: string, deleted?: boolean): Promise<boolean> {
    const options = {
      where: {
        id: id,
      },
      withDeleted: deleted,
    };

    return await this.exists(options);
  }

  async restaurar(id: string): Promise<UpdateResult> {
    return await this.restore(id);
  }
}
