import { IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsEmail(null, { message: 'Неверный формат почты' })
  email: string;
}
