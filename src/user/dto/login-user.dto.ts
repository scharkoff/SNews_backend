import { IsEmail, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail(undefined, { message: 'Неверный формат почты' })
  email: string;

  @Length(6, 40, {
    message: 'Пароль должен быть минимум 6 символов',
  })
  password_hash: string;
}
