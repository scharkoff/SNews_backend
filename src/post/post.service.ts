import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { SearchPostDTO } from './dto/search-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private repository: Repository<PostEntity>,
  ) {}

  create(createPostDto: CreatePostDto) {
    const { userId, ...postData } = createPostDto;
    return this.repository.save({
      user: { id: userId },
      ...postData,
    });
  }

  findAll() {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['user'],
    });
  }

  findAllPopular() {
    return this.repository.find({
      order: {
        views: 'DESC',
      },
      relations: ['user'],
    });
  }

  async findPostsByUserId(userId: number) {
    return await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.userId = :userId', { userId })
      .getMany();
  }

  async search(searchPostDTO: SearchPostDTO) {
    const qb = this.repository.createQueryBuilder('posts');

    qb.limit(searchPostDTO.limit || 0);

    if (searchPostDTO.views) {
      qb.orderBy('views', searchPostDTO.views);
    }

    if (searchPostDTO.body) {
      qb.andWhere('posts.body ILIKE :body', {
        body: `%${searchPostDTO.body}%`,
      });
    }

    if (searchPostDTO.title) {
      qb.andWhere('posts.title ILIKE :title', {
        title: `%${searchPostDTO.title}%`,
      });
    }

    if (searchPostDTO.tag) {
      qb.andWhere('posts.tag ILIKE :tag', {
        tag: `%${searchPostDTO.tag}%`,
      });
    }

    if (searchPostDTO.take) {
      qb.take(searchPostDTO.take);
    }

    if (searchPostDTO.page) {
      const skip = (searchPostDTO.page - 1) * (searchPostDTO.take || 10);
      qb.skip(skip);
    }

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number) {
    const post = await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException();
    }

    await this.repository.increment({ id }, 'views', 1);

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.repository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException();
    }

    await this.repository.update(id, updatePostDto);

    return await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id })
      .getOne();
  }

  async remove(id: number) {
    const post = await this.repository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException();
    }

    await this.repository.delete(id);

    return { message: `Запись с id ${id} успешно удалена` };
  }
}
