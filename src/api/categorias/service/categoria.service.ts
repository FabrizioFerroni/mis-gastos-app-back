import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaInterfaceRepository } from '../repository/categoria.interface.repository';
import { TransformDto } from '@/shared/utils';
import { CategoriaEntity } from '../entity/categoria.entyty';
import { ResponseCategoriaDto } from '../dto/response/response.categoria.dto';
import { UsuarioService } from '@/api/usuario/service/usuario.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationService } from '@/core/services/pagination.service';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import {
  CategoriaErrorMensaje,
  CategoriaMensaje,
} from '../messages/categoria.message';
import { AgregarCategoriaDto } from '../dto/create.categoria';
import { plainToInstance } from 'class-transformer';
import { EditarCategoriaDto } from '../dto/update.categoria';
import { separateUUIDUser } from '@/shared/utils/functions/separate-uuid';

const KEY: string = 'categorias';

@Injectable()
export class CategoriaService {
  private readonly logger = new Logger(CategoriaService.name, {
    timestamp: true,
  });

  constructor(
    @Inject(CategoriaInterfaceRepository)
    private readonly categoriaRepository: CategoriaInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      CategoriaEntity,
      ResponseCategoriaDto
    >,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(UsuarioService)
    private readonly usuarioServicio: UsuarioService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(usuario_id: string, param: PaginationDto) {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.CATEGORY;
    const skip = this.paginationService.calculateOffset(limit, page);

    const cacheKey = `${KEY}_${separateUUIDUser(usuario_id)}-p${page}-l${limit}`;

    const usuario = await this.usuarioServicio.findOne(usuario_id);

    const categoriasCache = await this.cacheManager.get<{
      categorias: CategoriaEntity[];
      meta: PaginationMeta;
    }>(cacheKey);

    const [data, count] = await this.categoriaRepository.obtenerTodos(
      usuario,
      skip,
      take,
    );

    const categorias: CategoriaEntity[] = this.transform.transformDtoArray(
      data,
      ResponseCategoriaDto,
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    if (categoriasCache) {
      const respCuenta = this.transform.transformDtoArray(
        categoriasCache.categorias,
        ResponseCategoriaDto,
      );

      return { categorias: respCuenta, meta: categoriasCache.meta };
    }

    const response = { categorias, meta };
    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  async getById(id: string) {
    const categoria = await this.categoriaRepository.obtenerPorId(id);

    if (!categoria) {
      this.logger.warn(CategoriaErrorMensaje.CATEGORY_NOT_FOUND_LOG);
      throw new NotFoundException(CategoriaErrorMensaje.CATEGORY_NOT_FOUND);
    }

    return this.transform.transformDtoObject(categoria, ResponseCategoriaDto);
  }

  async getByIdRel(id: string) {
    const categoria = await this.categoriaRepository.obtenerPorIdRel(id);

    if (!categoria) {
      this.logger.warn(CategoriaErrorMensaje.CATEGORY_NOT_FOUND_LOG);
      throw new NotFoundException(CategoriaErrorMensaje.CATEGORY_NOT_FOUND);
    }

    return this.transform.transformDtoObject(categoria, ResponseCategoriaDto);
  }

  async create(dto: AgregarCategoriaDto, usuario_id?: string) {
    const { nombre, descripcion, color, icono, tipo } = dto;

    await this.validateNombreBD(nombre, null, usuario_id);

    const newCategory = {
      nombre,
      descripcion,
      color,
      icono,
      tipo,
      usuario: usuario_id,
    };

    const data = plainToInstance(CategoriaEntity, newCategory);

    const accountSaved = await this.categoriaRepository.guardar(data);

    if (!accountSaved) {
      throw new BadRequestException(CategoriaErrorMensaje.CATEGORY_NOT_SAVED);
    }

    this.invalidateAllCacheKeys();

    return CategoriaMensaje.CATEGORY_OK;
  }

  async update(id: string, dto: EditarCategoriaDto, usuario_id: string) {
    const { nombre } = dto;

    const categoria = await this.categoriaRepository.obtenerPorId(id);

    if (!categoria)
      throw new NotFoundException(CategoriaErrorMensaje.CATEGORY_NOT_FOUND);

    await this.validateNombreBD(nombre, id, usuario_id);

    const categoriaToUpdate: Partial<CategoriaEntity> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        categoriaToUpdate[key] = dto[key];
      }
    }

    // TODO: Ver como editar usuario
    delete categoriaToUpdate['usuario_id'];

    const cuentaUpdated = await this.categoriaRepository.actualizar(
      id,
      categoriaToUpdate as CategoriaEntity,
    );

    if (!cuentaUpdated) {
      return CategoriaErrorMensaje.CATEGORY_NOT_SAVED;
    }

    this.invalidateAllCacheKeys();

    return CategoriaMensaje.CATEGORY_UPDATED;
  }

  async remove(id: string) {
    const categoria = await this.categoriaRepository.existeRegistro(id);

    if (!categoria)
      throw new NotFoundException(CategoriaErrorMensaje.CATEGORY_NOT_FOUND);

    const deleted = await this.categoriaRepository.borrar(id);

    if (!deleted.affected) {
      throw new BadRequestException(CategoriaErrorMensaje.CATEGORY_NOT_DELETED);
    }

    this.invalidateAllCacheKeys();

    return CategoriaMensaje.CATEGORY_DELETED;
  }

  async recover(id: string) {
    const categoria = await this.categoriaRepository.existeRegistro(id, true);

    if (!categoria)
      throw new NotFoundException(CategoriaErrorMensaje.CATEGORY_NOT_FOUND);

    const recover = await this.categoriaRepository.restaurar(id);

    if (!recover.affected) {
      throw new BadRequestException(
        CategoriaErrorMensaje.CATEGORY_NOT_RESTORED,
      );
    }

    this.invalidateAllCacheKeys();

    return CategoriaMensaje.CATEGORY_RESTORED;
  }

  async validateNombreBD(nombre: string, id?: string, usuario_id?: string) {
    const usuario = await this.usuarioServicio.findOneNewUser(usuario_id);

    const existInBD = await this.categoriaRepository.categoriaYaExiste(
      nombre,
      id,
      usuario,
    );

    if (existInBD) {
      this.logger.error(CategoriaErrorMensaje.CATEGORY_NOMBRE_EXIST);
      throw new BadRequestException(
        CategoriaErrorMensaje.CATEGORY_NOMBRE_EXIST,
      );
    }
  }

  async invalidateAllCacheKeys() {
    const keys = await this.cacheManager.store.keys(`${KEY}-*`);

    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
}
