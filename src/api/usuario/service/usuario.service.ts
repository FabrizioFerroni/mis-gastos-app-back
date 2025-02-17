import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioInterfaceRepository } from '../repository/usuario.interface.repository';
import { UsuarioEntity } from '../entity/usuario.entity';
import { AgregarUsuarioDto } from '../dto/create.user.dto';
import { TransformDto } from '@/shared/utils';
import { ResponseUsuarioDto } from '../dto/response/response.user.dto';
import { UserMessagesError } from '../errors/error-messages';
import {
  hashPassword,
  validatePassword,
} from '@/shared/utils/functions/validate-passwords';
import { plainToInstance } from 'class-transformer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EditarUsuarioDto } from '../dto/update.user';
import { getCurrency } from '@/shared/utils/functions/get-currencies';
import { AgregarCuentaDto } from '@/api/cuentas/dto/create.cuenta.dto';
import { TipoCuenta } from '@/api/cuentas/utils/cuentas.enum';
import { UsuarioMensaje } from '../messages/usuario.message';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name, {
    timestamp: true,
  });

  constructor(
    @Inject(UsuarioInterfaceRepository)
    private readonly usuarioRepository: UsuarioInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<UsuarioEntity, ResponseUsuarioDto>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: AgregarUsuarioDto) {
    const { nombre, apellido, email, pais, localizacion } = dto;

    if (dto.password) dto.password = await hashPassword(dto.password);

    await this.validateEmailBD(email);

    const token = crypto.randomUUID();

    const fechaActual = new Date();
    const nuevaFecha = new Date(fechaActual.getTime() + 60 * 60000);

    const newUser = {
      nombre,
      apellido,
      email,
      password: dto.password,
      active: false,
      token,
      expiration_token: nuevaFecha,
      pais,
      geoLocalizacion: localizacion,
    };

    const data: UsuarioEntity = plainToInstance(UsuarioEntity, newUser);

    const userNew = await this.usuarioRepository.guardar(data);

    if (!userNew) {
      throw new InternalServerErrorException(
        UserMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    const accountNew = this.createNewAccount(userNew);

    if (!accountNew) {
      await this.remove(userNew.id);
      throw new InternalServerErrorException(UserMessagesError.USER_ERROR);
    }

    return UsuarioMensaje.USER_OK;
  }

  async findAll(deletedAt: boolean, skip?: number, take?: number) {
    const key: string = 'usuarios';
    const userCache: UsuarioEntity[] = await this.cacheManager.get(key);
    const resp: UsuarioEntity[] = await this.usuarioRepository.obtenerTodos(
      deletedAt,
      skip,
      take,
    );

    resp.forEach((user) => delete user.password);

    const users: UsuarioEntity[] = this.transform.transformDtoArray(
      resp,
      ResponseUsuarioDto,
    );

    if (userCache)
      return this.transform.transformDtoArray(userCache, ResponseUsuarioDto);

    await this.cacheManager.set(key, users);

    return users;
  }

  async findOne(id: string) {
    const user = await this.usuarioRepository.obtenerPorId(id);
    delete user.password;

    if (!user) {
      this.logger.warn(
        `No se ha encontrado un usuario con el id: ${id} en nuestra base de datos`,
      );
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.active) {
      this.logger.warn(
        `El usuario con el id: ${id} no esta activo en nuestra base de datos`,
      );
      throw new BadRequestException('Usuario no activo');
    }

    return this.transform.transformDtoObject(user, ResponseUsuarioDto);
  }

  async findOneNewUser(id: string) {
    const user = await this.usuarioRepository.obtenerPorId(id);

    if (!user) {
      this.logger.warn(
        `No se ha encontrado un usuario con el id: ${id} en nuestra base de datos`,
      );
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.transform.transformDtoObject(user, ResponseUsuarioDto);
  }

  async update(id: string, data: EditarUsuarioDto) {
    delete data.confirm_password;
    await this.validateEmailBD(data.email, id);

    const user = await this.usuarioRepository.obtenerPorId(id);

    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (data.old_password) {
      const samePassword = await validatePassword(
        data.old_password,
        user.password,
      );

      if (!samePassword)
        throw new BadRequestException(
          'La contraseña ingresada no coincide con la contraseña anterior',
        );
    }

    delete data.old_password;

    if (data.password) data.password = await hashPassword(data.password);

    const userToUpdate: Partial<UsuarioEntity> = {};

    if (data.localizacion) userToUpdate.geoLocalizacion = data.localizacion;
    delete data.localizacion;

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        userToUpdate[key] = data[key];
      }
    }

    const userUpdate = await this.usuarioRepository.actualizar(
      id,
      userToUpdate as UsuarioEntity,
    );

    if (!userUpdate) {
      return UserMessagesError.USER_ERROR;
    }

    return UserMessagesError.USER_UPDATED;
  }

  async remove(id: string) {
    const userExist = await this.usuarioRepository.existeReg(id);

    if (!userExist) throw new BadRequestException('Usuario no encontrado');

    const deleted = await this.usuarioRepository.borrar(id);

    if (!deleted.affected) {
      throw new BadRequestException('No se pudo borrar el usuario');
    }

    return 'Usuario eliminado con éxito';
  }

  async recover(id: string) {
    const userExist = await this.usuarioRepository.existeReg(id, true);

    if (!userExist) throw new BadRequestException('Usuario no encontrado');

    const restore = await this.usuarioRepository.restaurar(id);

    if (!restore.affected) {
      throw new BadRequestException('No se pudo restaurar el usuario');
    }

    return 'Usuario restaurado con éxito';
  }

  async validateEmailBD(email: string, id?: string): Promise<void> {
    const existInBD = await this.usuarioRepository.usuarioYaExiste(email, id);

    if (existInBD) {
      throw new BadRequestException(UserMessagesError.USER_ALREADY_EXIST);
    }
  }

  createNewAccount(user: UsuarioEntity): boolean {
    const { id, pais } = user;

    const newAccount: AgregarCuentaDto = {
      nombre: 'Billetera',
      descripcion: 'Cuenta principal para los gastos',
      saldo: 0,
      icono: '💵',
      moneda: getCurrency(pais),
      tipo: TipoCuenta.EFECTIVO,
      nro_cuenta: null,
      usuario_id: id,
    };

    return this.eventEmitter.emit('user.created', newAccount);
  }
}
