import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TipoCuenta } from '../utils/cuentas.enum';

@Entity({ name: 'cuentas' })
@Unique(['nombre', 'nroCuenta', 'usuario'])
export class CuentaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 16, scale: 2, nullable: false, default: 0 })
  saldo: number;

  @Column({ nullable: true })
  icono: string;

  @Column({ nullable: false })
  moneda: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: TipoCuenta,
    default: TipoCuenta.EFECTIVO,
  })
  tipo: TipoCuenta;

  // TODO: nroCuenta tambien debe de ser unico
  @Column({ name: 'nro_cuenta', nullable: true })
  nroCuenta: string;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.cuentas, {
    cascade: ['soft-remove'],
    nullable: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt!: Date;
}
