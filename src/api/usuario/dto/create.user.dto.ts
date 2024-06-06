import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { UserMessagesError } from '../errors/error-messages';
import { PasswordVerify } from '../validations /passwordverify.validation';

export class AgregarUsuarioDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: UserMessagesError.USER_PASSWORD_NOT_STRONG,
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @PasswordVerify('password')
  confirm_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  pais: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  localizacion: string;
}
