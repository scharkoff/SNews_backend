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
      throw new NotFoundException('Комментарий не найден');
    }

    return this.repository.update(id, updateCommentDto);
  }

  async remove(id: number) {
    const comment = await this.repository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return this.repository.delete(id);
  }
}
