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
import { Tipos } from '@/shared/utils/enums/tipos.enum';
import { EditarCuentaDto } from '@/api/cuentas/dto/update.cuenta.dto';
import { separateUUIDUser } from '@/shared/utils/functions/separate-uuid';

const KEY: string = 'movimientos';
const KEY_USER: string = 'movimientos';

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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(CuentaService)
    private readonly cuentaServicio: CuentaService,
    @Inject(CategoriaService)
    private readonly categoriaServicio: CategoriaService,
    @Inject(UsuarioService)
    private readonly usuarioServicio: UsuarioService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(usuario_id: string, param: PaginationDto) {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.MOVEMENT;
    const skip = this.paginationService.calculateOffset(limit, page);

    const cacheKey = `${KEY_USER}_${separateUUIDUser(usuario_id)}-${page}-${limit}`;

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

  async getById(id: string, usuario_id: string) {
    const usuario = await this.usuarioServicio.findOne(usuario_id);
    const movimiento = await this.movimientoRepository.obtenerPorIdYUserId(
      id,
      usuario,
    );

    if (!movimiento) {
      this.logger.warn(
        `No se ha encontrado un movimiento con el id: ${id} en nuestra base de datos para el usuario ${usuario.nombre} ${usuario.apellido}`,
      );
      throw new NotFoundException(MovimientoErrorMensaje.MOVEMENT_NOT_FOUND);
    }

    return this.transform.transformDtoObject(movimiento, ResponseMovimientoDto);
  }

  async create(dto: AgregarMovimientoDto, usuario_id: string) {
    const {
      tipo,
      estado,
      fecha,
      concepto,
      movimiento,
      categoria_id,
      cuenta_id,
    } = dto;

    const cuenta = await this.cuentaServicio.getByIdRel(cuenta_id);

    if (cuenta.usuario.id !== usuario_id) {
      throw new BadRequestException(
        'La cuenta a la que quieres agregar un movimiento no pertenece a tu usuario',
      );
    }

    const categoria = await this.categoriaServicio.getByIdRel(categoria_id);

    if (categoria.usuario.id !== usuario_id) {
      throw new BadRequestException(
        'La categoria a la que quieres agregar un movimiento no pertenece a tu usuario',
      );
    }

    if (tipo !== categoria.tipo) {
      throw new BadRequestException(
        'El tipo de movimiento que estas queriendo agregar no se corresponde al tipo de la categoria. Por favor ingresa otra',
      );
    }

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

    // *OK: Dependiendo del tipo de ingreso restar saldo a la cuenta o sumar. ( Esto dependera del tipo de cuenta)
    const saldoCuenta = cuenta.saldo;
    let newSaldo = 0;

    switch (tipo) {
      case Tipos.INGRESO: {
        newSaldo = saldoCuenta + movimiento;
        break;
      }

      case Tipos.EGRESO: {
        newSaldo = saldoCuenta - movimiento;
        break;
      }

      default: {
        break;
      }
    }

    await this.cuentaServicio.incrementAndDecrementSaldo(cuenta.id, newSaldo);

    return MovimientoMensaje.MOVEMENT_OK;
  }

  async update(id: string, dto: EditarMovimientoDto, usuario_id: string) {
    const cuenta = await this.movimientoRepository.obtenerPorId(id);

    if (!cuenta)
      throw new NotFoundException(MovimientoErrorMensaje.MOVEMENT_NOT_FOUND);

    const movementToUpdated: Partial<MovimientoEntity> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        movementToUpdated[key] = dto[key];
      }
    }

    // movementToUpdated.usuario = usuario_id;

    // TODO: Ver como editar usuario ? ( no entendí que quise decir )
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
