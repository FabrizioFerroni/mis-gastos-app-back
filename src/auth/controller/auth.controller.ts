import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { LocalGuard } from '../guards/local.guard';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { AgregarUsuarioDto } from '../dto/register.dto';
import { TokenService } from '@/api/token/service/token.service';
import { PayloadDto } from '../dto/payload.dto';
import { VerifyDto } from '../dto/verify.dto';
import { ForgotPasswordDto } from '../dto/forgot-password';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RefreshtokenDto } from '../dto/refresh-token.dto';

@Controller('auth')
@ApiTags('Autenticación')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    isArray: false,
    description:
      'Sesión iniciada correctamente como usuario con las credenciales especificadas',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Usuario y/o contraseñas incorrectas',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiHeader({
    name: 'basic',
    description: 'Header para autenticación segura',
  })
  @ApiOperation({
    summary: 'Inicie sesión como usuario con las credenciales especificadas',
  })
  @Post('iniciarsesion')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  login(@Req() req: Request) {
    const user = req['user'] as UsuarioEntity;

    const payload: PayloadDto = {
      email: user.email,
      id: user.id,
    };

    return this.tokenService.generateJWTToken(payload, true, '', user);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateResponseDto,
    isArray: false,
    description: 'Crear un nuevo usuario en la aplicación',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({
    summary: 'Crear un nuevo usuario en la aplicación.',
  })
  @Post('registrarse')
  register(@Body() data: AgregarUsuarioDto) {
    return this.authService.create(data);
  }

  @Post('verificar/:token')
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    isArray: false,
    description:
      'Validar un nuevo usuario si existe en la base de datos con correo electrónico',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Validar un nuevo usuario si existe en la base de datos con correo electrónico',
  })
  validateUser(@Param('token') token: string, @Body() dto: VerifyDto) {
    const { token: tokenBody } = dto;

    if (token !== tokenBody) {
      throw new BadRequestException('Token inválido');
    }

    return this.authService.validateUser(dto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    isArray: false,
    description: 'Pedir cambio de clave para el usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Email incorrecto',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({
    summary: 'Pedir cambio de clave para el usuario',
  })
  @Post('olvide-clave')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    isArray: false,
    description: 'Metodo para cambiar la clave del usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Datos incorrecto',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    isArray: false,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({
    summary: 'Metodo para cambiar la clave del usuario',
  })
  @Post('cambiar-clave/:token')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Param('token') token: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const { token: tokenBody } = dto;

    if (token !== tokenBody) {
      throw new BadRequestException('Token inválido');
    }

    return this.authService.changePassword(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Metodo para refrescar el token del usuario',
  })
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshtokenDto) {
    return this.authService.refresh(dto);
  }
}
