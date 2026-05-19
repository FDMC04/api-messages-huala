import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  nombre: string;

  @Column('text', {
    array: true,
  })
  participantes: string[];

  @Column('int')
  tipo: number; // 0 = privado, 1 = grupo

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  mensajes: {
    id: string;
    remitente: string;
    mensaje: string;
    fecha: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('text', {
    nullable: true,
  })
  ultimoMensaje?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  ultimoMensajeFecha?: Date;

  @Column('text', {
    nullable: true,
  })
  admin?: string;

  @Column('text', {
    nullable: true,
  })
  portada?: string;
}
