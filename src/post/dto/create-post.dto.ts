import { IsNotEmpty, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Заголовок поста не может быть пустым' })
  title: string;

  @IsNotEmpty({ message: 'Содержимое поста не может быть пустым' })
  body: string;

  @IsArray({ message: 'Тэги должны быть в формате массива' })
  tags: string;
}
