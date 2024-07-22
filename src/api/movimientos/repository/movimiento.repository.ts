import { InjectRepository } from '@nestjs/typeorm';
import { MovimientoEntity } from '../entity/movimientos.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ResponseMovimientoDto } from '../dto/response/response.movimiento.dto';
import { TransformDto } from '@/shared/utils';
import { Inject, Logger } from '@nestjs/common';
import { MovimientoInterfaceRepository } from './movimiento.interface.repository';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';

export class MovimientoRepository
  extends BaseAbstractRepository<MovimientoEntity>
  implements MovimientoInterfaceRepository
{
  private readonly logger = new Logger(MovimientoRepository.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(MovimientoEntity)
    public repository: Repository<MovimientoEntity>,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      MovimientoEntity,
      ResponseMovimientoDto
    >,
  ) {
    super(repository);
  }

  async obtenerTodosAndCount(
    skip?: number,
    take?: number,
  ): Promise<[MovimientoEntity[], number]> {
    const options = {
      skip: skip,
      take: take,
      relations: {
        cuenta: true,
        categoria: true,
        usuario: true,
      },
    };

    return await this.findAndCount(options);
  }

  async obtenerTodosPorUsuario(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<[MovimientoEntity[], number]> {
    const options = {
      skip: skip,
      take: take,
      where: {
        usuario: usuario,
      },
      relations: {
        cuenta: true,
        categoria: true,
        usuario: true,
      },
    };

    return await this.findAndCount(options);
  }

  async obtenerPorId(id: string): Promise<MovimientoEntity> {
    return await this.findOneById(id);
  }

  async guardar(data: MovimientoEntity): Promise<MovimientoEntity> {
    const create: MovimientoEntity = this.create(data);
    const movimientoSaved: MovimientoEntity = await this.save(create);
    return movimientoSaved;
  }

  async borrar(id: string): Promise<UpdateResult> {
    return await this.softDelete(id);
  }

  async actualizar(id: string, data: MovimientoEntity): Promise<UpdateResult> {
    return await this.update(id, data);
  }

  async obtenerRelaciones(): Promise<MovimientoEntity[]> {
    const options = {
      relations: {},
    };
    return await this.findWithRelations(options);
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
