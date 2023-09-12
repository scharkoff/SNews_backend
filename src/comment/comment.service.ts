import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private repository: Repository<CommentEntity>,
    private dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      await queryRunner.commitTransaction();

      return updatedComment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleMethodErrors(error, id);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = await this.repository.findOneBy({ id });

      if (!comment) {
        throw new NotFoundException();
      }

      this.repository.delete(id);

      await queryRunner.commitTransaction();

      return { message: `Комментарий с id ${id} успешно удален` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleMethodErrors(error, id);
    } finally {
      await queryRunner.release();
    }
  }
}

function handleMethodErrors(error: any, id: number) {
  if (error.status == 404) {
    throw new NotFoundException(`Комментарий с id ${id} не найден`);
  } else {
    throw new InternalServerErrorException('Произошла серверная ошибка');
  }
}
