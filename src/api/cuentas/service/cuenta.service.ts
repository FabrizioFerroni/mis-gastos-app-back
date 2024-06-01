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
import { configApp } from '@/config/app/config.app';
import { AgregarCuentaDto } from '../dto/create.cuenta.dto';
import { plainToInstance } from 'class-transformer';
import { UsuarioService } from '@/api/usuario/service/usuario.service';
import { EditarCuentaDto } from '../dto/update.cuenta.dto';

@Injectable()
export class CuentaService {
  private readonly logger = new Logger(CuentaService.name, { timestamp: true });

  // TODO: cuando se hace una creacion, actualizacion, borrado y restaurado de cuenta hay que actualizar el cache para que traiga los datos correctamente.

  constructor(
    @Inject(CuentaInterfaceRepository)
    private readonly cuentaRepository: CuentaInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<CuentaEntity, ResponseCuentaDto>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usuarioServicio: UsuarioService,
  ) {}

  async findAll(skip?: number, take?: number) {
    const key: string = 'cuentas';
    const cuentasCache: CuentaEntity[] = await this.cacheManager.get(key);
    const resp: CuentaEntity[] = await this.cuentaRepository.obtenerTodos(
      skip,
      take,
    );

    const cuentas: CuentaEntity[] = this.transform.transformDtoArray(
      resp,
      ResponseCuentaDto,
    );

    if (cuentasCache)
      return this.transform.transformDtoArray(cuentasCache, ResponseCuentaDto);

    await this.cacheManager.set(key, cuentas, configApp().redis.ttl);

    return cuentas;
  }

  async findAllByUser(usuario_id: string, skip?: number, take?: number) {
    const usuario = await this.usuarioServicio.findOne(usuario_id);
    const key: string = 'cuentas_usuario';
    const cuentasCache: CuentaEntity[] = await this.cacheManager.get(key);
    const resp: CuentaEntity[] =
      await this.cuentaRepository.obtenerTodosPorUsuario(usuario, skip, take);

    const cuentas: CuentaEntity[] = this.transform.transformDtoArray(
      resp,
      ResponseCuentaDto,
    );

    if (cuentasCache)
      return this.transform.transformDtoArray(cuentasCache, ResponseCuentaDto);

    await this.cacheManager.set(key, cuentas, configApp().redis.ttl);

    return cuentas;
  }

  async getById(id: string) {
    const cuenta = await this.cuentaRepository.obtenerPorId(id);

    if (!cuenta) {
      this.logger.warn(
        `No se ha encontrado una cuenta con el id: ${id} en nuestra base de datos`,
      );
      throw new NotFoundException('Cuenta no encontrado');
    }

    return this.transform.transformDtoObject(cuenta, ResponseCuentaDto);
  }

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

    await this.validateNombreBD(nombre);
    await this.validateNroCuentaBD(nro_cuenta);

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

    return CuentaMensaje.ACCOUNT_OK;
  }

  async update(id: string, dto: EditarCuentaDto) {
    const { nombre, nro_cuenta } = dto;

    const cuenta = await this.cuentaRepository.obtenerPorId(id);

    if (!cuenta)
      throw new NotFoundException(CuentaErrorMensaje.ACCOUNT_NOT_FOUND);

    await this.validateNombreBD(nombre, id);
    await this.validateNroCuentaBD(nro_cuenta, id);

    const cuentaToUpdate: Partial<CuentaEntity> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        cuentaToUpdate[key] = dto[key];
      }
    }

    const cuentaUpdated = await this.cuentaRepository.actualizar(
      id,
      cuentaToUpdate as CuentaEntity,
    );

    if (!cuentaUpdated) {
      return CuentaErrorMensaje.ACCOUNT_NOT_SAVED;
    }

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

    return CuentaMensaje.ACCOUNT_RESTORED;
  }

  // validations
  async validateNombreBD(nombre: string, id?: string) {
    const existInBD = await this.cuentaRepository.cuentaYaExiste(nombre, id);

    if (existInBD) {
      this.logger.error(CuentaErrorMensaje.ACCOUNT_NOMBRE_EXIST);
      throw new BadRequestException(CuentaErrorMensaje.ACCOUNT_NOMBRE_EXIST);
    }
  }

  async validateNroCuentaBD(nroCuenta: string, id?: string) {
    const existInBD = await this.cuentaRepository.nroCuentaYaExiste(
      nroCuenta,
      id,
    );

    if (existInBD) {
      throw new BadRequestException(
        CuentaErrorMensaje.ACCOUNT_NRO_CUENTA_EXIST,
      );
    }
  }
}
