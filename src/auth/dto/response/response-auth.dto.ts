import { Exclude, Expose, Transform } from 'class-transformer';

export class AuthResponseDto {
  @Expose({ name: 'id' })
  @Transform((value) => value.value.toString(), { toPlainOnly: true })
  id: string;

  @Expose()
  nombre: string;

  @Expose()
  apellido: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  active: boolean;

  @Expose()
  online: boolean;

  @Expose()
  avatar: string;

  @Expose()
  pais: string;

  @Expose({ name: 'localizacion' })
  geoLocalizacion: string;

  @Exclude()
  token: string;

  @Exclude()
  expiration_token: Date;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
