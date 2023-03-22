import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 30, {
    message: 'Логин не может менее 3 символов и превышать 30 символов',
  })
  login: string;

  @Length(6, 40, {
    message: 'Пароль должен быть минимум 6 символов',
  })
  password_hash: string;

  @Length(1, 30, {
    message: 'Фамилия не может быть пустой и превышать 30 символов',
  })
  last_name: string;

  @Length(1, 30, {
    message: 'Имя не может быть пустым и превышать 30 символов',
  })
  first_name: string;

  @IsEmail(undefined, { message: 'Неверный формат почты' })
  email: string;
}
