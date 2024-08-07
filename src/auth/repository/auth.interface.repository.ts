import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AuthInterfaceRepository extends BaseAbstractRepository<UsuarioEntity> {
  abstract obtenerPorEmail(email: string): Promise<UsuarioEntity>;
}
