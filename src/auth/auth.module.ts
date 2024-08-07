import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DecryptCredentialsService } from './services/decrypt-credentials.service';
import { AuthService } from './services/auth.service';
import { AuthInterfaceRepository } from './repository/auth.interface.repository';
import { AuthRepository } from './repository/auth.repository';
import { TransformDto } from '@/shared/utils';
import { UsuarioModule } from '@/api/usuario/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { configApp } from '@/config/app/config.app';
import { UsuarioInterfaceRepository } from '@/api/usuario/repository/usuario.interface.repository';
import { UsuarioRepository } from '@/api/usuario/repository/usuario.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { AuthController } from './controller/auth.controller';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from '@/api/token/token.module';
import { CoreModule } from '@/core/core.module';
import { DecriptHeaderBodyMiddleware } from './middlewares/decriptheaderbody.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity]),
    UsuarioModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: configApp().secret_jwt,
          signOptions: {
            expiresIn: '10m',
          },
        };
      },
    }),
    TokenModule,
    CoreModule,
  ],
  controllers: [AuthController],
  providers: [
    DecryptCredentialsService,
    AuthService,
    {
      provide: AuthInterfaceRepository,
      useClass: AuthRepository,
    },
    {
      provide: UsuarioInterfaceRepository,
      useClass: UsuarioRepository,
    },
    TransformDto,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthInterfaceRepository, TransformDto, DecryptCredentialsService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DecriptHeaderBodyMiddleware)
      .forRoutes({ path: 'auth/*', method: RequestMethod.POST });
  }
}
