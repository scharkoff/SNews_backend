import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Комментарий не может быть пустым' })
  text: string;

  @IsNotEmpty({ message: 'Идентификатор записи не может быть пустым' })
  postId: number;

  @IsNotEmpty({ message: 'Идентификатор автора не может быть пустым' })
  userId: number;
}
