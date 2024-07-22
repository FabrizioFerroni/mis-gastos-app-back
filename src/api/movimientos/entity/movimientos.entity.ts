import { CategoriaEntity } from '@/api/categorias/entity/categoria.entyty';
import { CuentaEntity } from '@/api/cuentas/entity/cuenta.entity';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { Tipos } from '@/shared/utils/enums/tipos.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'movimientos' })
export class MovimientoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Tipos,
  })
  tipo: Tipos;

  @Column({
    type: 'tinyint',
    nullable: false,
  })
  estado: number;

  @Column({ type: 'date', nullable: false })
  fecha: Date;

  @Column({ type: 'text', nullable: false })
  concepto: string;

  @Column({
    type: 'decimal',
    nullable: false,
    precision: 16,
    scale: 2,
    default: 0,
  })
  movimiento: number;

  @ManyToOne(() => CategoriaEntity, {
    cascade: ['soft-remove'],
    nullable: false,
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaEntity;

  @ManyToOne(() => CuentaEntity, {
    cascade: ['soft-remove'],
    nullable: false,
  })
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: CuentaEntity;

  @ManyToOne(() => UsuarioEntity, {
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
