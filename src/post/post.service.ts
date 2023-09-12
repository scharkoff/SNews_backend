import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = await this.repository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.id = :id', { id })
        .getOne();

      if (!post) {
        throw new NotFoundException();
      }

      await this.repository.increment({ id }, 'views', 1);

      await queryRunner.commitTransaction();

      return post;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = await this.repository.findOneBy({ id });

      if (!post) {
        throw new NotFoundException();
      }

      await this.repository.update(id, updatePostDto);

      const updatedPost = await this.repository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.id = :id', { id })
        .getOne();

      await queryRunner.commitTransaction();

      return updatedPost;
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
      const post = await this.repository.findOneBy({ id });

      if (!post) {
        throw new NotFoundException();
      }

      this.repository.delete(id);

      await queryRunner.commitTransaction();

      return { message: `Запись с id ${id} успешно удалена` };
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
    throw new NotFoundException(`Запись с id ${id} не найдена`);
  } else {
    throw new InternalServerErrorException('Произошла серверная ошибка');
  }
}
