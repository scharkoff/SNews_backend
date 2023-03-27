import { ForbiddenException } from '@nestjs/common';

interface IError {
  code: string;
  detail: string;
}

export function checkErrorCodeAndDetail(error: IError) {
  if (error.code === '23505' && error.detail.includes('login')) {
    throw new ForbiddenException('Данный логин уже используется');
  }

  if (error.code === '23505' && error.detail.includes('email')) {
    throw new ForbiddenException('Данная почта уже используется');
  }

  throw new ForbiddenException('Не удалось зарегистрироваться');
}
