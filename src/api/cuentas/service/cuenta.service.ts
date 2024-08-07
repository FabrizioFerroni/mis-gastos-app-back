import { PaginationMeta } from './../../../core/interfaces/pagination-meta.interface';
import {
  CuentaErrorMensaje,
  CuentaMensaje,
} from './../messages/cuenta.message';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CuentaInterfaceRepository } from '../repository/cuenta.interface.repository';
import { TransformDto } from '@/shared/utils';
import { CuentaEntity } from '../entity/cuenta.entity';
import { ResponseCuentaDto } from '../dto/response/response.cuenta.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AgregarCuentaDto } from '../dto/create.cuenta.dto';
import { plainToInstance } from 'class-transformer';
import { UsuarioService } from '@/api/usuario/service/usuario.service';
import { EditarCuentaDto } from '../dto/update.cuenta.dto';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { PaginationService } from '@/core/services/pagination.service';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { OnEvent } from '@nestjs/event-emitter';
import { separateUUIDUser } from '@/shared/utils/functions/separate-uuid';

const KEY: string = 'cuentas';
const KEY_USER: string = 'cuentas_usuario';
@Injectable()
export class CuentaService {
  private readonly logger = new Logger(CuentaService.name, { timestamp: true });

  constructor(
    @Inject(CuentaInterfaceRepository)
    private readonly cuentaRepository: CuentaInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<CuentaEntity, ResponseCuentaDto>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(UsuarioService)
    private readonly usuarioServicio: UsuarioService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(param: PaginationDto) {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.ACCOUNT;
    const skip = this.paginationService.calculateOffset(limit, page);

    const cacheKey = `${KEY}-${page}-${limit}`;

    const cuentasCache = await this.cacheManager.get<{
      cuentas: CuentaEntity[];
      meta: PaginationMeta;
    }>(cacheKey);

    const [data, count] = await this.cuentaRepository.obtenerTodosAndCount(
      skip,
      take,
    );

    const cuentas: CuentaEntity[] = this.transform.transformDtoArray(
      data,
      ResponseCuentaDto,
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    if (cuentasCache) {
      const respCuenta = this.transform.transformDtoArray(
        cuentasCache.cuentas,
        ResponseCuentaDto,
      );

      return { cuentas: respCuenta, meta: cuentasCache.meta };
    }

    const response = { cuentas, meta };
    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  async findAllByUser(usuario_id: string, param: PaginationDto) {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.ACCOUNT;
    const skip = this.paginationService.calculateOffset(limit, page);

    const cacheKey = `${KEY}_${separateUUIDUser(usuario_id)}-p${page}-l${limit}`;

    const usuario = await this.usuarioServicio.findOne(usuario_id);

    const cuentasCache = await this.cacheManager.get<{
      cuentas: CuentaEntity[];
      meta: PaginationMeta;
    }>(cacheKey);

    const [data, count] = await this.cuentaRepository.obtenerTodosPorUsuario(
      usuario,
      skip,
      take,
    );

    const cuentas: CuentaEntity[] = this.transform.transformDtoArray(
      data,
      ResponseCuentaDto,
    );

    const meta = this.paginationService.createMeta(limit, page, count);

    if (cuentasCache) {
      const respCuenta = this.transform.transformDtoArray(
        cuentasCache.cuentas,
        ResponseCuentaDto,
      );

      return { cuentas: respCuenta, meta: cuentasCache.meta };
    }

    const response = { cuentas, meta };
    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  async getById(id: string, usuario_id: string) {
    const usuario = await this.usuarioServicio.findOne(usuario_id);
    const cuenta = await this.cuentaRepository.obtenerPorIdYUsuarioId(
      id,
      usuario,
    );

    if (!cuenta) {
      this.logger.warn(
        `No se ha encontrado una cuenta con el id: ${id} en nuestra base de datos`,
      );
      throw new NotFoundException('Cuenta no encontrado');
    }

    return this.transform.transformDtoObject(cuenta, ResponseCuentaDto);
  }

  async getByIdRel(id: string) {
    const cuenta = await this.cuentaRepository.obtenerPorIdRel(id);

    if (!cuenta) {
      this.logger.warn(
        `No se ha encontrado una cuenta con el id: ${id} en nuestra base de datos`,
      );
      throw new NotFoundException('Cuenta no encontrado');
    }

    return this.transform.transformDtoObject(cuenta, ResponseCuentaDto);
  }

  @OnEvent('user.created')
  async create(dto: AgregarCuentaDto) {
    const {
      nombre,
      descripcion,
      saldo,
      icono,
      moneda,
      tipo,
      nro_cuenta,
      usuario_id,
    } = dto;

    await this.validateNombreBD(nombre, null, usuario_id);
    if (dto.nro_cuenta !== null)
      await this.validateNroCuentaBD(nro_cuenta, null, usuario_id);

    const newAccount = {
      nombre,
      descripcion,
      saldo,
      icono,
      moneda,
      tipo,
      nroCuenta: nro_cuenta,
      usuario: usuario_id,
    };

    const data = plainToInstance(CuentaEntity, newAccount);

    const accountSaved = await this.cuentaRepository.guardar(data);

    if (!accountSaved) {
      throw new BadRequestException(CuentaErrorMensaje.ACCOUNT_NOT_SAVED);
    }

    this.invalidateAllCacheKeys();

    return CuentaMensaje.ACCOUNT_OK;
  }

  async update(id: string, dto: EditarCuentaDto) {
    const { nombre, nro_cuenta } = dto;

    const cuenta = await this.cuentaRepository.obtenerPorId(id);

    if (!cuenta)
      throw new NotFoundException(CuentaErrorMensaje.ACCOUNT_NOT_FOUND);

    await this.validateNombreBD(nombre, id, dto.usuario_id);
    await this.validateNroCuentaBD(nro_cuenta, id, dto.usuario_id);

    const cuentaToUpdate: Partial<CuentaEntity> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        cuentaToUpdate[key] = dto[key];
      }
    }

    // TODO: Ver como editar usuario
    delete cuentaToUpdate['usuario_id'];

    const cuentaUpdated = await this.cuentaRepository.actualizar(
      id,
      cuentaToUpdate as CuentaEntity,
    );

    if (!cuentaUpdated) {
      return CuentaErrorMensaje.ACCOUNT_NOT_SAVED;
    }

    this.invalidateAllCacheKeys();

    return CuentaMensaje.ACCOUNT_UPDATED;
  }

  async incrementAndDecrementSaldo(id: string, saldo: number) {
    const cuenta = await this.cuentaRepository.obtenerPorId(id);

    if (!cuenta)
      throw new NotFoundException(CuentaErrorMensaje.ACCOUNT_NOT_FOUND);

    const cuentaToUpdate: Partial<CuentaEntity> = {};

    cuentaToUpdate.saldo = saldo;

    const cuentaUpdated = await this.cuentaRepository.actualizar(
      id,
      cuentaToUpdate as CuentaEntity,
    );

    if (!cuentaUpdated) {
      return CuentaErrorMensaje.ACCOUNT_NOT_SAVED;
    }

    this.invalidateAllCacheKeys();

    return CuentaMensaje.ACCOUNT_UPDATED;
  }

  async remove(id: string) {
    const cuenta = await this.cuentaRepository.existeRegistro(id);

    if (!cuenta)
      throw new NotFoundException(CuentaErrorMensaje.ACCOUNT_NOT_FOUND);

    const deleted = await this.cuentaRepository.borrar(id);

    if (!deleted.affected) {
      throw new BadRequestException(CuentaErrorMensaje.ACCOUNT_NOT_DELETED);
    }

    this.invalidateAllCacheKeys();

    return CuentaMensaje.ACCOUNT_DELETED;
  }

  async recover(id: string) {
    const userExist = await this.cuentaRepository.existeRegistro(id, true);

    if (!userExist)
      throw new NotFoundException(CuentaErrorMensaje.ACCOUNT_NOT_FOUND);

    const restore = await this.cuentaRepository.restaurar(id);

    if (!restore.affected) {
      throw new BadRequestException(CuentaErrorMensaje.ACCOUNT_NOT_RESTORED);
    }

    this.invalidateAllCacheKeys();

    return CuentaMensaje.ACCOUNT_RESTORED;
  }

  // validations
  async validateNombreBD(nombre: string, id?: string, usuario_id?: string) {
    const usuario = await this.usuarioServicio.findOneNewUser(usuario_id);

    const existInBD = await this.cuentaRepository.cuentaYaExiste(
      nombre,
      id,
      usuario,
    );

    if (existInBD) {
      this.logger.error(CuentaErrorMensaje.ACCOUNT_NOMBRE_EXIST);
      throw new BadRequestException(CuentaErrorMensaje.ACCOUNT_NOMBRE_EXIST);
    }
  }

  async validateNroCuentaBD(
    nroCuenta: string,
    id?: string,
    usuario_id?: string,
  ) {
    const usuario = await this.usuarioServicio.findOneNewUser(usuario_id);
    const existInBD = await this.cuentaRepository.nroCuentaYaExiste(
      nroCuenta,
      id,
      usuario,
    );

    if (existInBD) {
      throw new BadRequestException(
        CuentaErrorMensaje.ACCOUNT_NRO_CUENTA_EXIST,
      );
    }
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
