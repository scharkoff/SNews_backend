import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
  ) {}

  create(createCommentDto: CreateCommentDto) {
    return this.repository.save({
      text: createCommentDto.text,
      post: { id: createCommentDto.postId },
      user: { id: createCommentDto.userId },
    });
  }

  findAll() {
    return this.repository.find();
  }

  async findAllByPostId(postId: number) {
    return await this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.postId = :postId', { postId })
      .getMany();
  }

  async findAllByUserId(userId: number) {
    return await this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.userId = :userId', { userId })
      .getMany();
  }

  async findOne(id: number) {
    const comment = await this.repository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.repository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException();
    }

    await this.repository.update(id, updateCommentDto);

    const updatedComment = await this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.id = :id', { id })
      .getOne();

    return updatedComment;
  }

  async remove(id: number) {
    const comment = await this.repository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException();
    }

    await this.repository.delete(id);

    return { message: `Комментарий с id ${id} успешно удален` };
  }
}
