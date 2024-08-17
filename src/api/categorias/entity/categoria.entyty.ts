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
import { Tipos } from '@/shared/utils/enums/tipos.enum';

@Entity({ name: 'categorias' })
@Unique(['nombre', 'usuario'])
export class CategoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  icono: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Tipos,
    default: Tipos.EGRESO,
  })
  tipo: Tipos;

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
