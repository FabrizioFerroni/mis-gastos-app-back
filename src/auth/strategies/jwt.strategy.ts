import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { configApp } from '@/config/app/config.app';
import { TokenDto } from '../dto/token.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configApp().secret_jwt,
      ignoreExpiration: false,
    });
  }

  validate(payload: TokenDto) {
    return payload;
  }
}
