import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { DataSource, Repository } from 'typeorm';
import { SearchPostDTO } from './dto/search-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private repository: Repository<PostEntity>,
    private dataSource: DataSource,
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
    });
  }

  findAllPopular() {
    return this.repository.find({
      order: {
        views: 'DESC',
      },
    });
  }

  async search(searchPostDTO: SearchPostDTO) {
    const qb = this.repository.createQueryBuilder('posts');

    qb.limit(searchPostDTO.limit || 0);
    qb.take(searchPostDTO.take || 10);

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

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = await this.repository.findOneBy({ id });

      if (!post) {
        throw new Error('Статья не найдена');
      }

      await this.repository.increment({ id }, 'views', 1);

      await queryRunner.commitTransaction();

      return post;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException('Статья не найдена');
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.repository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }

    return this.repository.update(id, updatePostDto);
  }

  async remove(id: number) {
    const post = await this.repository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }

    return this.repository.delete(id);
  }
}
