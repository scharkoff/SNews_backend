import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Заголовок поста не может быть пустым' })
  title: string;

  @IsNotEmpty({ message: 'Содержимое поста не может быть пустым' })
  body: string;

  tags: string;
}
