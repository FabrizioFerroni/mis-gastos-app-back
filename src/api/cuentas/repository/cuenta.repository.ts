import { InjectRepository } from '@nestjs/typeorm';
import { CuentaEntity } from '../entity/cuenta.entity';
import { CuentaInterfaceRepository } from './cuenta.interface.repository';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { Not, Repository, UpdateResult } from 'typeorm';
import { TransformDto } from '@/shared/utils';
import { Inject, Logger } from '@nestjs/common';
import { ResponseCuentaDto } from '../dto/response/response.cuenta.dto';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';

export class CuentaRepository
  extends BaseAbstractRepository<CuentaEntity>
  implements CuentaInterfaceRepository
{
  private readonly logger = new Logger(CuentaRepository.name, {
    timestamp: true,
  });

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
      skip: skip,
      take: take,
      relations: {
        usuario: true,
      },
    };

    return await this.findAll(options);
  }

  async obtenerTodosAndCount(
    skip?: number,
    take?: number,
  ): Promise<[CuentaEntity[], number]> {
    const options = {
      skip: skip,
      take: take,
      relations: {
        usuario: true,
      },
    };

    return await this.findAndCount(options);
  }

  async obtenerTodosPorUsuario(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<[CuentaEntity[], number]> {
    const options = {
      skip: skip,
      take: take,
      where: {
        usuario: usuario,
      },
    };

    return await this.findAndCount(options);
  }

  async obtenerPorId(id: string): Promise<CuentaEntity> {
    return await this.findOneById(id);
  }

  async obtenerPorIdYUsuarioId(
    id: string,
    usuario: UsuarioEntity,
  ): Promise<CuentaEntity> {
    const options = {
      where: {
        id: String(id),
        usuario: usuario,
      },
    };

    const cuenta = await this.findByCondition(options);

    if (!cuenta) {
      return null;
    }

    return cuenta;
  }

  async obtenerPorIdRel(id: string): Promise<CuentaEntity> {
    const options = {
      where: {
        id: id,
      },
      relations: {
        usuario: true,
      },
    };
    return await this.findByCondition(options);
  }

  async guardar(data: CuentaEntity): Promise<CuentaEntity> {
    const create: CuentaEntity = this.create(data);
    const cuentaSaved: CuentaEntity = await this.save(create);
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

  async cuentaYaExiste(
    nombre: string,
    id?: string,
    usuario?: UsuarioEntity,
  ): Promise<boolean> {
    const options: any = {
      where: {
        nombre: nombre,
        usuario: { id: usuario.id },
      },
      relations: ['usuario'],
    };

    if (id) {
      options.where.id = Not(id);
    }

    const result = await this.findByCondition(options);
    return !!result;
  }

  async nroCuentaYaExiste(
    nroCuenta: string,
    id?: string,
    usuario?: UsuarioEntity,
  ): Promise<boolean> {
    let result: CuentaEntity;

    if (!id) {
      const options = {
        where: {
          nroCuenta: String(nroCuenta),
          usuario: {
            id: usuario.id,
          },
        },
        relations: ['usuario'],
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
