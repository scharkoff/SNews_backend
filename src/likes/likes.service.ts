import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeEntity } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly repository: Repository<LikeEntity>,
  ) {}

  async likePost(userId: number, postId: number) {
    const existingLike = await this.repository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (existingLike) {
      throw new HttpException('Пост уже оценен', HttpStatus.CONFLICT);
    }

    const like = await this.repository.create({
      user: { id: userId },
      post: { id: postId },
    });

    return await this.repository.save(like);
  }

  async unlikePost(userId: number, postId: number) {
    const like = await this.repository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (like) {
      await this.repository.remove(like);
      return { message: `Лайк с поста ${postId} успешно удален` };
    }

    throw new HttpException('Лайк не найден', HttpStatus.NOT_FOUND);
  }

  async findLikesByPostId(postId: number) {
    const [items, total] = await this.repository.findAndCount({
      where: { post: { id: postId } },
    });

    return { items, total };
  }
}
