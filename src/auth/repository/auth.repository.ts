import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { BaseAbstractRepository } from '@/config/database/mysql/mysql.base.repository';
import { AuthInterfaceRepository } from './auth.interface.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class AuthRepository
  extends BaseAbstractRepository<UsuarioEntity>
  implements AuthInterfaceRepository
{
  constructor(
    @InjectRepository(UsuarioEntity)
    public repository: Repository<UsuarioEntity>,
  ) {
    super(repository);
  }

  async obtenerPorEmail(email: string): Promise<UsuarioEntity> {
    const options = {
      where: {
        email: String(email),
      },
    };

    const user = await this.findByCondition(options);

    if (!user) {
      return null;
    }

    return user;
  }
}
