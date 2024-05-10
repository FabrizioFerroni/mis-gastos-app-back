import { TypeOrmModule } from '@nestjs/typeorm';
import { configApp } from '../app/config.app';
import { Module } from '@nestjs/common';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [configApp],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: configApp().database.host,
      port: configApp().database.port,
      username: configApp().database.username,
      password: configApp().database.password,
      database: configApp().database.database,
      entities: [UsuarioEntity],
      synchronize: true,
      verboseRetryLog: true,
    }),
  ],
})
export class DatabaseModule {}
