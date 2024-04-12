import { TypeOrmModule } from '@nestjs/typeorm';
import { configApp } from '../app/config.app';
import { Module } from '@nestjs/common';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: configApp().db.host,
      port: configApp().db.port,
      username: configApp().db.user,
      password: configApp().db.pass,
      database: configApp().db.bd,
      entities: [UsuarioEntity],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
