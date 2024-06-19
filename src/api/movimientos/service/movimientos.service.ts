import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MovimientoInterfaceRepository } from '../repository/movimiento.interface.repository';
import { TransformDto } from '@/shared/utils';
import { MovimientoEntity } from '../entity/movimientos.entity';
import { ResponseMovimientoDto } from '../dto/response/response.movimiento.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsuarioService } from '@/api/usuario/service/usuario.service';
import { PaginationService } from '@/core/services/pagination.service';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { CuentaService } from '@/api/cuentas/service/cuenta.service';
import { CategoriaService } from '@/api/categorias/service/categoria.service';
import {
  MovimientoErrorMensaje,
  MovimientoMensaje,
} from '../messages/movimientos.messages';
import { AgregarMovimientoDto } from '../dto/create.dto';
import { plainToInstance } from 'class-transformer';
import { EditarMovimientoDto } from '../dto/update.dto';

const KEY: string = 'movimientos';
const KEY_USER: string = 'movimientos_usuario';

@Injectable()
export class MovimientosService {
  private readonly logger = new Logger(MovimientosService.name, {
    timestamp: true,
  });

  constructor(
    @Inject(MovimientoInterfaceRepository)
    private readonly movimientoRepository: MovimientoInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      MovimientoEntity,
      ResponseMovimientoDto
    >,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(CuentaService)
    private readonly cuentaServicio: CuentaService,
    @Inject(CategoriaService)
    private readonly categoriaServicio: CategoriaService,
    @Inject(UsuarioService)
    private readonly usuarioServicio: UsuarioService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(param: PaginationDto) {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.MOVEMENT;
    const skip = this.paginationService.calculateOffset(limit, page);

    const cacheKey = `${KEY}-${page}-${limit}`;

    const movimientosCache = await this.cacheManager.get<{
      movimientos: MovimientoEntity[];
      meta: PaginationMeta;
    }>(cacheKey);

    const [data, count] = await this.movimientoRepository.obtenerTodosAndCount(
      skip,
      take,
    );

    const movimientos: MovimientoEntity[] = this.transform.transformDtoArray(
      data,
      ResponseMovimientoDto,
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    if (movimientosCache) {
      const respMovimientos = this.transform.transformDtoArray(
        movimientosCache.movimientos,
        ResponseMovimientoDto,
      );

      return { movimientos: respMovimientos, meta: movimientosCache.meta };
    }

    const response = { movimientos, meta };
    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  async findAllByUser(usuario_id: string, param: PaginationDto) {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.MOVEMENT;
    const skip = this.paginationService.calculateOffset(limit, page);

    const cacheKey = `${KEY_USER}-${page}-${limit}`;

    const usuario = await this.usuarioServicio.findOne(usuario_id);

    const movimientosCache = await this.cacheManager.get<{
      movimientos: MovimientoEntity[];
      meta: PaginationMeta;
    }>(cacheKey);

    const [data, count] =
      await this.movimientoRepository.obtenerTodosPorUsuario(
        usuario,
        skip,
        take,
      );

    const movimientos: MovimientoEntity[] = this.transform.transformDtoArray(
      data,
      ResponseMovimientoDto,
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    if (movimientosCache) {
      const respMovimientos = this.transform.transformDtoArray(
        movimientosCache.movimientos,
        ResponseMovimientoDto,
      );

      return { movimientos: respMovimientos, meta: movimientosCache.meta };
    }

    const response = { movimientos, meta };
    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  async getById(id: string) {
    const movimiento = await this.movimientoRepository.obtenerPorId(id);

    if (!movimiento) {
      this.logger.warn(
        `No se ha encontrado un movimiento con el id: ${id} en nuestra base de datos`,
      );
      throw new NotFoundException(MovimientoErrorMensaje.MOVEMENT_NOT_FOUND);
    }

    return this.transform.transformDtoObject(movimiento, ResponseMovimientoDto);
  }

  async create(dto: AgregarMovimientoDto) {
    const {
      tipo,
      estado,
      fecha,
      concepto,
      movimiento,
      categoria_id,
      cuenta_id,
      usuario_id,
    } = dto;

    const newMovement = {
      tipo,
      estado,
      fecha,
      concepto,
      movimiento,
      categoria: categoria_id,
      cuenta: cuenta_id,
      usuario: usuario_id,
    };

    const data = plainToInstance(MovimientoEntity, newMovement);

    const movementSaved = await this.movimientoRepository.guardar(data);

    if (!movementSaved) {
      throw new BadRequestException(MovimientoErrorMensaje.MOVEMENT_NOT_SAVED);
    }

    this.invalidateAllCacheKeys();

    return MovimientoMensaje.MOVEMENT_OK;
  }

  async update(id: string, dto: EditarMovimientoDto) {
    const cuenta = await this.movimientoRepository.obtenerPorId(id);

    if (!cuenta)
      throw new NotFoundException(MovimientoErrorMensaje.MOVEMENT_NOT_FOUND);

    const movementToUpdated: Partial<MovimientoEntity> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        movementToUpdated[key] = dto[key];
      }
    }

    // TODO: Ver como editar usuario
    delete movementToUpdated['cuenta_id'];
    delete movementToUpdated['categoria_id'];
    delete movementToUpdated['usuario_id'];

    const cuentaUpdated = await this.movimientoRepository.actualizar(
      id,
      movementToUpdated as MovimientoEntity,
    );

    if (!cuentaUpdated) {
      return MovimientoErrorMensaje.MOVEMENT_NOT_SAVED;
    }

    this.invalidateAllCacheKeys();

    return MovimientoMensaje.MOVEMENT_UPDATED;
  }

  async remove(id: string) {
    const movimiento = await this.movimientoRepository.existeRegistro(id);

    if (!movimiento)
      throw new NotFoundException(MovimientoErrorMensaje.MOVEMENT_NOT_FOUND);

    const deleted = await this.movimientoRepository.borrar(id);

    if (!deleted.affected) {
      throw new BadRequestException(
        MovimientoErrorMensaje.MOVEMENT_NOT_DELETED,
      );
    }

    this.invalidateAllCacheKeys();

    return MovimientoMensaje.MOVEMENT_DELETED;
  }

  async recover(id: string) {
    const movimiento = await this.movimientoRepository.existeRegistro(id, true);

    if (!movimiento)
      throw new NotFoundException(MovimientoErrorMensaje.MOVEMENT_NOT_FOUND);

    const restore = await this.movimientoRepository.restaurar(id);

    if (!restore.affected) {
      throw new BadRequestException(
        MovimientoErrorMensaje.MOVEMENT_NOT_RESTORED,
      );
    }

    this.invalidateAllCacheKeys();

    return MovimientoMensaje.MOVEMENT_RESTORED;
  }

  async invalidateAllCacheKeys() {
    const keys = await this.cacheManager.store.keys(`${KEY}-*`);
    const keys_user = await this.cacheManager.store.keys(`${KEY_USER}-*`);

    for (const key of keys) {
      await this.cacheManager.del(key);
    }

    for (const key of keys_user) {
      await this.cacheManager.del(key);
    }
  }
}
