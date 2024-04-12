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
import { hashPassword } from '@/shared/utils/functions/validate-passwords';
import { plainToInstance } from 'class-transformer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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

  async findAll() {
    const key: string = 'usuarios';
    const userCache = await this.cacheManager.get(key);
    const resp = await this.usuarioRepository.obtenerTodos();
    const users = this.transform.transformDtoArray(resp, ResponseUsuarioDto);

    if (userCache) return userCache;

    await this.cacheManager.set(key, users, 1000 * 30);

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

  async update(id: string) {
    return `This action updates a #${id} fakes2`;
  }

  async remove(id: string) {
    /* const user = await this.usuarioRepository.obtenerPorId(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    } */

    const deleted = await this.usuarioRepository.borrar(id);

    if (!deleted.affected) {
      throw new BadRequestException('No se pudo borrar el usuario');
    }

    return 'Usuario eliminado con éxito';
  }

  async validateEmailBD(email: string, id?: string): Promise<void> {
    const existInBD = await this.usuarioRepository.usuarioYaExiste(email, id);

    if (existInBD) {
      throw new BadRequestException(UserMessagesError.USER_ALREADY_EXIST);
    }
  }
}
