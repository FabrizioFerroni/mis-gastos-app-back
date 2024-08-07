import { configApp } from '@/config/app/config.app';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthInterfaceRepository } from '../repository/auth.interface.repository';
import { UsuarioInterfaceRepository } from '@/api/usuario/repository/usuario.interface.repository';
import { TransformDto } from '@/shared/utils';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { AuthResponseDto } from '../dto/response/response-auth.dto';
import { AuthMessagesError } from '../errors/error-messages';
import { LoginDto } from '../dto/login.dto';
import { EditarUsuarioDto } from '@/api/usuario/dto/update.user';
import {
  hashPassword,
  validatePassword,
} from '@/shared/utils/functions/validate-passwords';
import { TokenService } from '@/api/token/service/token.service';
import { MailService } from '@/core/services/mail.service';
import { AgregarCuentaDto } from '@/api/cuentas/dto/create.cuenta.dto';
import { getCurrency } from '@/shared/utils/functions/get-currencies';
import { TipoCuenta } from '@/api/cuentas/utils/cuentas.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { AgregarUsuarioDto } from '../dto/register.dto';
import { UserMessagesError } from '@/api/usuario/errors/error-messages';
import { UsuarioService } from '@/api/usuario/service/usuario.service';
import { UsuarioMensaje } from '@/api/usuario/messages/usuario.message';
import { PayloadDto } from '../dto/payload.dto';
import { CreateTokenDto } from '@/api/token/dtos/token.dto';
import { UpdateTokenDto } from '@/api/token/dtos/update-token.dto';
import { VerifyDto } from '../dto/verify.dto';
import { ForgotPasswordDto } from '../dto/forgot-password';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RefreshtokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private failedLoginAttempts = new Map<string, number>();
  private password_failures: number = configApp().max_pass_failures;
  private readonly logger = new Logger(AuthService.name, { timestamp: true });
  private bodyMail: Record<string, string> = {};

  constructor(
    private readonly authRepository: AuthInterfaceRepository,
    private readonly userRepository: UsuarioInterfaceRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<UsuarioEntity, AuthResponseDto>,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
    private readonly usuarioService: UsuarioService,
  ) {
    this.bodyMail = {
      urlApp: configApp().appHost,
      mailApp: configApp().appMail,
      imgApp: configApp().appImg,
    };
  }

  async handleFailedLogin(email: string, id: string) {
    const attempts = this.failedLoginAttempts.get(email) || 0;
    this.failedLoginAttempts.set(email, attempts + 1);

    if (attempts + 1 >= this.password_failures) {
      await this.saveUser(id, false);

      this.handleSuccessfulLogin(email);
      throw new BadRequestException(AuthMessagesError.USER_BLOCKED);
    }
  }

  async handleSuccessfulLogin(email: string) {
    this.failedLoginAttempts.delete(email);
  }

  async login(dto: LoginDto) {
    if (dto.email !== null) dto.email = dto.email.toLowerCase();
    const user = await this.authRepository.obtenerPorEmail(dto.email);

    if (!user || !user.active) {
      throw new NotFoundException(
        !user
          ? AuthMessagesError.USER_NOT_FOUND
          : AuthMessagesError.USER_IS_NOT_ACTIVE,
      );
    }

    const passwordIsValid = await validatePassword(dto.password, user.password);

    if (!passwordIsValid) {
      await this.handleFailedLogin(dto.email, user.id);
      throw new BadRequestException(
        AuthMessagesError.PASSWORD_OR_EMAIL_INVALID,
      );
    }

    await this.handleSuccessfulLogin(dto.email);

    return this.transform.transformDtoObject(user, AuthResponseDto);
  }

  async create(dto: AgregarUsuarioDto) {
    const { nombre, apellido, email } = dto;

    if (dto.password) dto.password = await hashPassword(dto.password);

    await this.validateEmailBD(email);

    const token_id = crypto.randomUUID();

    const payload: PayloadDto = {
      email,
      id: token_id,
    };

    const token = this.tokenService.generateJWTToken(payload, false, '24h');

    this.bodyMail.email = email;
    this.bodyMail.nombre = nombre;
    this.bodyMail.lastname = apellido;
    this.bodyMail.url = `${configApp().appHost}/verificar/${token}`;
    this.bodyMail.subject =
      'Gracias por registrarte, por favor confirma tu correo electronico';

    const responseMail = await this.mailService.sendMail(
      'register',
      this.bodyMail,
    );

    if (!responseMail.ok) {
      this.logger.warn(responseMail.message);
      throw new InternalServerErrorException(
        AuthMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    const tokenData: CreateTokenDto = {
      token: token.toString(),
      email,
      isUsed: false,
      token_id,
    };

    this.tokenService.saveToken(tokenData);

    const newUser = {
      nombre,
      apellido,
      email,
      password: dto.password,
      active: false,
    };

    const data: UsuarioEntity = plainToInstance(UsuarioEntity, newUser);

    const userNew = await this.userRepository.guardar(data);

    if (!userNew) {
      throw new InternalServerErrorException(
        UserMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    const accountNew = this.createNewAccount(userNew);

    if (!accountNew) {
      await this.usuarioService.remove(userNew.id);
      throw new InternalServerErrorException(UserMessagesError.USER_ERROR);
    }

    return UsuarioMensaje.USER_OK;
  }

  async validateUser(dto: VerifyDto) {
    const { email, token } = dto;

    const verifyToken: Record<string, string> =
      this.tokenService.verifyTokenCatch(
        token,
        configApp().secret_jwt_register,
      );

    const userEmailToken = verifyToken['email'];
    const tokenIdJWT = verifyToken['id'];

    const tokenData = await this.tokenService.findByTokenId(tokenIdJWT);

    if (tokenData.isUsed) {
      throw new BadRequestException(AuthMessagesError.USER_TOKEN_USED);
    }

    if (userEmailToken !== email) {
      throw new BadRequestException(AuthMessagesError.USER_MAIL_DIFFERENT);
    }

    const updateTokenData: Partial<UpdateTokenDto> = {
      isUsed: true,
    };

    const tokenId = tokenData.id.toString();

    await this.tokenService.updateToken(tokenId, updateTokenData);

    const user = await this.authRepository.obtenerPorEmail(userEmailToken);

    if (!user) {
      throw new NotFoundException(UserMessagesError.USER_NOT_FOUND);
    }

    const editUser = {
      active: true,
    };

    const result = await this.userRepository.update(
      user.id,
      editUser as UsuarioEntity,
    );

    if (!result) {
      throw new BadRequestException(UserMessagesError.USER_ERROR);
    }

    this.bodyMail.email = email;
    this.bodyMail.nombre = user.nombre;
    this.bodyMail.lastname = user.apellido;
    this.bodyMail.url = `${configApp().appHost}/iniciarsesion`;
    this.bodyMail.subject = `${user.nombre}, gracias por activar tu cuenta`;

    const responseMail = await this.mailService.sendMail(
      'login',
      this.bodyMail,
    );

    if (!responseMail.ok) {
      this.logger.warn(responseMail.message);
      throw new InternalServerErrorException(
        AuthMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    return UserMessagesError.USER_VALIDATED;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.authRepository.obtenerPorEmail(email);

    if (!user) {
      throw new NotFoundException(UserMessagesError.USER_NOT_FOUND);
    }

    const token_id = crypto.randomUUID();

    const payload: PayloadDto = {
      email,
      id: token_id,
    };

    const token = this.tokenService.generateJWTToken(payload, false, '1h');

    this.bodyMail.email = email;
    this.bodyMail.nombre = user.nombre;
    this.bodyMail.lastname = user.apellido;
    this.bodyMail.url = `${configApp().appHost}/cambiar-clave/${token}`;
    this.bodyMail.subject = `${user.nombre}, sigue los pasos para recuperar tu contraseña`;

    const responseMail = await this.mailService.sendMail(
      'forgot_password',
      this.bodyMail,
    );

    if (!responseMail.ok) {
      this.logger.warn(responseMail.message);
      throw new InternalServerErrorException(
        AuthMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    const tokenData: CreateTokenDto = {
      token: token.toString(),
      email,
      isUsed: false,
      token_id,
    };

    const tokenSaved = this.tokenService.saveToken(tokenData);

    if (!tokenSaved) {
      throw new InternalServerErrorException(
        AuthMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    return 'Se ha enviado un correo a su dirección para recuperar su contraseña.';
  }

  async changePassword(dto: ChangePasswordDto) {
    const { email, password, confirm_password, token } = dto;

    const verifyToken: Record<string, string> =
      this.tokenService.verifyTokenCatch(
        token,
        configApp().secret_jwt_register,
      );

    const userEmailToken = verifyToken['email'];

    const tokenIdJWT = verifyToken['id'];

    const tokenData = await this.tokenService.findByTokenId(tokenIdJWT);

    if (tokenData.isUsed) {
      throw new BadRequestException(AuthMessagesError.USER_TOKEN_USED);
    }

    if (userEmailToken !== email) {
      throw new BadRequestException(AuthMessagesError.USER_MAIL_DIFFERENT);
    }

    const updateTokenData: Partial<UpdateTokenDto> = {
      isUsed: true,
    };

    const tokenId = tokenData.id.toString();

    await this.tokenService.updateToken(tokenId, updateTokenData);

    const user = await this.authRepository.obtenerPorEmail(userEmailToken);

    if (!user) {
      throw new NotFoundException(UserMessagesError.USER_NOT_FOUND);
    }

    if (password !== confirm_password) {
      throw new BadRequestException(UserMessagesError.USER_PASSWORD_NOT_MATCH);
    }

    const editUser = {
      password: await hashPassword(password),
    };

    const result = await this.userRepository.update(
      user.id,
      editUser as UsuarioEntity,
    );

    if (!result) {
      throw new BadRequestException(UserMessagesError.USER_ERROR);
    }

    this.bodyMail.email = email;
    this.bodyMail.nombre = user.nombre;
    this.bodyMail.lastname = user.apellido;
    this.bodyMail.url = `${configApp().appHost}/iniciarsesion`;
    this.bodyMail.subject = `${user.nombre}, has cambiado con éxito la contraseña`;

    const responseMail = await this.mailService.sendMail(
      'recovery',
      this.bodyMail,
    );

    if (!responseMail.ok) {
      this.logger.warn(responseMail.message);
      throw new InternalServerErrorException(
        AuthMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    return 'Se cambio la contraseña correctamente.';
  }

  // TODO: Falta el metodo para refrescar el token.

  async refresh({ token }: RefreshtokenDto) {
    const tokenOld = this.tokenService.verifyTokenCatch(
      token,
      configApp().secret_jwt_refresh,
    );

    if (!tokenOld) throw new UnauthorizedException('Token invalido');

    const payload: PayloadDto = {
      email: tokenOld.email,
      id: tokenOld.id,
    };

    const newToken = this.tokenService.refreshJWTToken(payload);

    return newToken;
  }

  async saveUser(id: string, active: boolean) {
    const partialUpdate: Partial<EditarUsuarioDto> = {
      active: active,
    };

    return await this.userRepository.actualizar(
      id,
      partialUpdate as UsuarioEntity,
    );
  }

  async validateEmailBD(email: string, id?: string): Promise<void> {
    const existInBD = await this.userRepository.usuarioYaExiste(email, id);

    if (existInBD) {
      throw new BadRequestException(UserMessagesError.USER_ALREADY_EXIST);
    }
  }

  createNewAccount(user: UsuarioEntity): boolean {
    const { id } = user;

    const newAccount: AgregarCuentaDto = {
      nombre: 'Billetera',
      descripcion: 'Cuenta principal para los gastos',
      saldo: 0,
      icono: null,
      moneda: getCurrency('España'),
      tipo: TipoCuenta.EFECTIVO,
      nro_cuenta: null,
      usuario_id: id,
    };

    return this.eventEmitter.emit('user.created', newAccount);
  }
}
