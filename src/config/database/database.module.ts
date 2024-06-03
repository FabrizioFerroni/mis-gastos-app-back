import { TypeOrmModule } from '@nestjs/typeorm';
import { configApp } from '../app/config.app';
import { Logger as NestLogger, Module } from '@nestjs/common';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { ConfigModule } from '@nestjs/config';
import { CuentaEntity } from '@/api/cuentas/entity/cuenta.entity';
import BDFileLogs from './logger/BDFileLog';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [configApp],
      envFilePath: ['.env'],
    }),
    // DATABASE_TYPE
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'mysql',
        host: configApp().database.host,
        port: configApp().database.port,
        username: configApp().database.username,
        password: configApp().database.password,
        database: configApp().database.database,
        entities: [UsuarioEntity, CuentaEntity],
        synchronize: configApp().env === 'development' ? true : false,
        verboseRetryLog: true,
        logging:
          configApp().env === 'development'
            ? 'all'
            : ['error', 'warn', 'schema'],
        logger: new BDFileLogs(new NestLogger()),
      }),
    }),
  ],
})
export class DatabaseModule {}
