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

@Injectable()
export class CuentaService {
  private readonly logger = new Logger(CuentaService.name, { timestamp: true });

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

    return await this.cuentaRepository.guardar(data);
  }

  // validations
  async validateNombreBD(nombre: string, id?: string) {
    const existInBD = await this.cuentaRepository.cuentaYaExiste(nombre, id);

    if (existInBD) {
      throw new BadRequestException(
        `La cuenta con el nombre: ${nombre} ya existe`,
      );
    }
  }

  async validateNroCuentaBD(nroCuenta: string, id?: string) {
    const existInBD = await this.cuentaRepository.nroCuentaYaExiste(
      nroCuenta,
      id,
    );

    if (existInBD) {
      throw new BadRequestException(
        `La cuenta con el numero de cuenta: ${nroCuenta} ya existe`,
      );
    }
  }
}
