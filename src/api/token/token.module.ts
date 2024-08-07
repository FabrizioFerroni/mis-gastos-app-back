import { Module } from '@nestjs/common';
import { TokenService } from './service/token.service';
import { TransformDto } from '@/shared/utils';
import { TokenInterfaceRepository } from './repository/token.interface.repository';
import { TokenRepository } from './repository/token.repository';
import { TokenController } from './controller/token.controller';
import { configApp } from '@/config/app/config.app';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TokenEntity } from './entity/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
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
  ],
  providers: [
    TokenService,
    {
      provide: TokenInterfaceRepository,
      useClass: TokenRepository,
    },
    TransformDto,
  ],
  controllers: [TokenController],
  exports: [TokenService, TransformDto],
})
export class TokenModule {}
