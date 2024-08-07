import { CuentaEntity } from '@/api/cuentas/entity/cuenta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'usuarios' })
@Unique(['email'])
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column({ select: true })
  password: string;

  @Column({ default: false, select: true })
  active: boolean;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, select: false })
  token: string;

  @Column({ nullable: true, select: false })
  expiration_token: Date;

  @Column({ nullable: true })
  pais: string;

  @Column({ name: 'localizacion', nullable: true })
  geoLocalizacion: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt?: Date;

  @OneToMany(() => CuentaEntity, (cuenta) => cuenta.usuario)
  cuentas: CuentaEntity[];
}
