import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 30)
  login: string;

  password_hash: string;

  @Length(3, 30)
  last_name: string;

  @Length(3, 30)
  first_name: string;

  @IsEmail()
  email: string;
}
