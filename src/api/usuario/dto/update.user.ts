import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserMessagesError } from '../errors/error-messages';
import { PasswordVerify } from '../validations /passwordverify.validation';

export class EditarUsuarioDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  @ApiProperty()
  nombre: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty()
  apellido: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
  email: string;

  @IsOptional()
  @ApiProperty()
  old_password: string;

  @IsOptional()
  @ApiProperty()
  @ValidateIf((c) => c.old_password !== '')
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

  @ValidateIf((c) => c.password !== '')
  @ApiProperty()
  @PasswordVerify('password')
  confirm_password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty()
  pais: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty()
  localizacion: string;
}
