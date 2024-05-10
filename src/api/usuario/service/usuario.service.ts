import {
  BadRequestException,
  Inject,
  Injectable,
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
import { configApp } from '@/config/app/config.app';

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('UsuarioInterfaceRepository')
    private readonly usuarioRepository: UsuarioInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<UsuarioEntity, ResponseUsuarioDto>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: AgregarUsuarioDto) {
    const { nombre, apellido, email } = dto;

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
    };

    const data: UsuarioEntity = plainToInstance(UsuarioEntity, newUser);

    return await this.usuarioRepository.guardar(data);
  }

  async findAll(deletedAt: boolean, skip?: number, take?: number) {
    const key: string = 'usuarios';
    const userCache: UsuarioEntity[] = await this.cacheManager.get(key);
    const resp: UsuarioEntity[] = await this.usuarioRepository.obtenerTodos(
      deletedAt,
      skip,
      take,
    );

    const users: UsuarioEntity[] = this.transform.transformDtoArray(
      resp,
      ResponseUsuarioDto,
    );

    if (userCache)
      return this.transform.transformDtoArray(userCache, ResponseUsuarioDto);

    await this.cacheManager.set(key, users, configApp().redis.ttl);

    return users;
  }

  async findOne(id: string) {
    const user = await this.usuarioRepository.obtenerPorId(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.active) throw new BadRequestException('Usuario no activo');

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
}
