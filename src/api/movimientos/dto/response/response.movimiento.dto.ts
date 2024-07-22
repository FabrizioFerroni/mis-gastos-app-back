import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Tipos } from '@/shared/utils/enums/tipos.enum';
import { CategoriaEntity } from '@/api/categorias/entity/categoria.entyty';
import { CuentaEntity } from '@/api/cuentas/entity/cuenta.entity';

export class ResponseMovimientoDto {
  @Expose({ name: 'id' })
  @Transform((value) => value.value.toString(), { toPlainOnly: true })
  id: string;

  @Expose()
  tipo: Tipos;

  @Expose()
  estado: number;

  @Expose()
  fecha: Date;

  @Expose()
  concepto: string;

  @Expose()
  movimiento: number;

  @Expose()
  categoria: CategoriaEntity;

  @Expose()
  cuenta: CuentaEntity;

  @Expose()
  usuario: UsuarioEntity;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
