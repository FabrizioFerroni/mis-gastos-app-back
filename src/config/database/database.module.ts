import { TypeOrmModule } from '@nestjs/typeorm';
import { configApp } from '../app/config.app';
import { Logger as NestLogger, Module } from '@nestjs/common';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { ConfigModule } from '@nestjs/config';
import { CuentaEntity } from '@/api/cuentas/entity/cuenta.entity';
import { getSecretByName } from '@/core/functions/infisical';
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
        host: await getSecretByName('DATABASE_HOST'),
        port: +(await getSecretByName('DATABASE_PORT')),
        username: await getSecretByName('DATABASE_USER'),
        password: await getSecretByName('DATABASE_PASSWORD'),
        database: await getSecretByName('DATABASE_BASEDATOS'),
        entities: [UsuarioEntity, CuentaEntity],
        synchronize:
          (await getSecretByName('API_ENV')) === 'development' ? true : false,
        verboseRetryLog: true,
        logging:
          (await getSecretByName('API_ENV')) === 'development'
            ? 'all'
            : ['error', 'warn', 'schema'],
        logger: new BDFileLogs(new NestLogger()),
      }),
    }),
  ],
})
export class DatabaseModule {}
