import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { TipoCategoria } from '../../utils/tipos.enum';

export class ResponseCategoriaDto {
  @Expose({ name: 'id' })
  @Transform((value) => value.value.toString(), { toPlainOnly: true })
  id: string;

  @Expose()
  nombre: string;

  @Expose()
  descripcion: string;

  @Expose()
  color: string;

  @Expose()
  icono: string;

  @Expose()
  tipo: TipoCategoria;

  @Expose()
  usuario: UsuarioEntity;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
