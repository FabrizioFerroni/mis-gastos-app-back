import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AuthMessagesError } from '../errors/error-messages';

export class TokenDto {
  @IsEmail({}, { message: AuthMessagesError.USER_EMAIL_VALID })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  sub: string;
}
