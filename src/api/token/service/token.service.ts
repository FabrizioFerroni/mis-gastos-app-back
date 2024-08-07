import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenInterfaceRepository } from '../repository/token.interface.repository';
import { TokenEntity } from '../entity/token.entity';
import { TokenResponseDto } from '../dtos/response/response.tokens.dto';
import { TransformDto } from '@/shared/utils';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { AuthResponseDto } from '@/auth/dto/response/response-auth.dto';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { UpdateTokenDto } from '../dtos/update-token.dto';
import { TokenMessagesError } from '../errors/error-messages';
import { configApp } from '@/config/app/config.app';
import { PayloadDto } from '@/auth/dto/payload.dto';
import { CreateTokenDto } from '../dtos/token.dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name, { timestamp: true });

  constructor(
    @Inject(TransformDto)
    private readonly transform: TransformDto<UsuarioEntity, AuthResponseDto>,
    private readonly transformToken: TransformDto<
      TokenEntity,
      TokenResponseDto
    >,
    private jwtService: JwtService,
    private readonly tokenRepository: TokenInterfaceRepository,
  ) {}

  async saveToken(data: CreateTokenDto) {
    const newToken: Partial<TokenEntity> = {
      token: data.token,
      email: data.email,
      token_id: data.token_id,
      isUsed: data.isUsed,
    };

    return this.tokenRepository.saveToken(newToken as TokenEntity);
  }

  async findByTokenId(tokenId: string) {
    const token = await this.tokenRepository.findByTokenId(tokenId);

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return this.transformToken.transformDtoObject(token, TokenResponseDto);
  }

  async updateToken(id: string, data: UpdateTokenDto) {
    const token = await this.tokenRepository.findById(id);

    if (!token) {
      throw new NotFoundException(TokenMessagesError.TOKEN_NOT_FOUND);
    }

    const tokenToUpdate: Partial<TokenEntity> = {};

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        tokenToUpdate[key] = data[key];
      }
    }

    const userUpdated = await this.tokenRepository.updateToken(
      id,
      tokenToUpdate as TokenEntity,
    );

    if (!userUpdated) {
      return TokenMessagesError.TOKEN_ERROR;
    }

    return TokenMessagesError.TOKEN_UPDATED;
  }

  generateJWTToken(
    payload: PayloadDto,
    login: boolean,
    expireIn?: string,
    user?: UsuarioEntity,
  ) {
    if (!login) {
      if (!configApp().secret_jwt_register) {
        this.logger.error('Secret JWT not set');
        throw new InternalServerErrorException(
          TokenMessagesError.INTERNAL_SERVER_ERROR,
        );
      }

      return this.jwtService.sign(payload, {
        expiresIn: expireIn,
        secret: configApp().secret_jwt_register,
      });
    }

    const userRes = this.transform.transformDtoObject(user, AuthResponseDto);

    return {
      user: userRes,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: configApp().secret_jwt_refresh,
        expiresIn: '1h',
      }),
    };
  }

  verifyJWTToken(token: string, secret?: string) {
    return this.jwtService.verify(token, {
      secret: secret,
    });
  }

  verifyTokenCatch(token: string, secret?: string): Record<string, string> {
    try {
      return this.verifyJWTToken(token, secret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // Manejo del error TokenExpiredError
        throw new BadRequestException('El token ha expirado.');
      } else if (error instanceof JsonWebTokenError) {
        // Manejo de otros errores relacionados con JWT
        throw new BadRequestException('Token inválido.');
      } else if (error instanceof NotBeforeError) {
        // Manejo del error NotBeforeError
        throw new BadRequestException('El token aún no es válido.');
      } else {
        // Manejo de otros posibles errores
        throw new BadRequestException('Error al verificar el token.');
      }
    }
  }

  refreshJWTToken(payload: PayloadDto) {
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: configApp().secret_jwt_refresh,
        expiresIn: '1h',
      }),
    };
  }
}
