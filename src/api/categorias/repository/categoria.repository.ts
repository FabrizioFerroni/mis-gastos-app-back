import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaInterfaceRepository } from './categoria.interface.repository';
import { CategoriaEntity } from '../entity/categoria.entyty';
import { Logger } from '@nestjs/common';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { Not, Repository, UpdateResult } from 'typeorm';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';

export class CategoriaRepository
  extends BaseAbstractRepository<CategoriaEntity>
  implements CategoriaInterfaceRepository
{
  private readonly logger = new Logger(CategoriaRepository.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(CategoriaEntity)
    public repository: Repository<CategoriaEntity>,
  ) {
    super(repository);
  }

  async obtenerTodos(usuario: UsuarioEntity): Promise<CategoriaEntity[]> {
    const options = {
      where: {
        usuario: usuario,
      },
    };

    return await this.findAll(options);
  }

  async obtenerTodosPorUsuario(
    usuario: UsuarioEntity,
    skip?: number,
    take?: number,
  ): Promise<[CategoriaEntity[], number]> {
    const options = {
      skip: skip,
      take: take,
      where: {
        usuario: usuario,
      },
    };

    return await this.findAndCount(options);
  }

  async obtenerPorId(id: string): Promise<CategoriaEntity> {
    return await this.findOneById(id);
  }

  async obtenerPorIdRel(id: string): Promise<CategoriaEntity> {
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

  async guardar(data: CategoriaEntity): Promise<CategoriaEntity> {
    const create: CategoriaEntity = this.create(data);
    const cuentaSaved: CategoriaEntity = await this.save(create);
    return cuentaSaved;
  }

  async borrar(id: string): Promise<UpdateResult> {
    return await this.softDelete(id);
  }

  async actualizar(id: string, data: CategoriaEntity): Promise<UpdateResult> {
    return await this.update(id, data);
  }

  async obtenerRelaciones(): Promise<CategoriaEntity[]> {
    const options = {
      relations: {},
    };
    return await this.findWithRelations(options);
  }

  async categoriaYaExiste(
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
