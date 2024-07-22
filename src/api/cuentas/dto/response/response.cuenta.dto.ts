import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { TipoCuenta } from '../../utils/cuentas.enum';

export class ResponseCuentaDto {
  @Expose({ name: 'id' })
  @Transform((value) => value.value.toString(), { toPlainOnly: true })
  id: string;

  @Expose()
  nombre: string;

  @Expose()
  descripcion: string;

  @Expose()
  saldo: number;

  @Expose()
  icono: string;

  @Expose()
  moneda: string;

  @Expose()
  tipo: TipoCuenta;

  @Expose()
  nroCuenta: string;

  @Expose()
  usuario: UsuarioEntity;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
