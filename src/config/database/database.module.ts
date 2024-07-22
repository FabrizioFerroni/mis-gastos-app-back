import { TypeOrmModule } from '@nestjs/typeorm';
import { configApp } from '../app/config.app';
import { Logger as NestLogger, Module } from '@nestjs/common';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { ConfigModule } from '@nestjs/config';
import { CuentaEntity } from '@/api/cuentas/entity/cuenta.entity';
import BDFileLogs from './logger/BDFileLog';
import { CategoriaEntity } from '@/api/categorias/entity/categoria.entyty';
import { MovimientoEntity } from '@/api/movimientos/entity/movimientos.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}.local`],
      load: [configApp],
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
        entities: [
          UsuarioEntity,
          CuentaEntity,
          CategoriaEntity,
          MovimientoEntity,
        ],
        synchronize:
          configApp().env === 'development'
            ? true
            : configApp().env === 'test'
              ? true
              : false,
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
