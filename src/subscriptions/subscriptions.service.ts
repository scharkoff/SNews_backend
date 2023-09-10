import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repository: Repository<SubscriptionEntity>,
    private dataSource: DataSource,
  ) {}

  async create(id: number, followingId: number) {
    const subscription = this.repository.create({
      follower: { id: id },
      following: { id: followingId },
    });
    return await this.repository.save(subscription);
  }

  async findAll() {
    return await this.repository.find({
      relations: ['follower', 'following'],
    });
  }

  async findAllByFollowerId(followerId: number) {
    return await this.repository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.follower', 'follower')
      .leftJoinAndSelect('subscription.following', 'following')
      .where('subscription.follower = :followerId', { followerId })
      .getMany();
  }

  async remove(subscriptionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.repository.delete(subscriptionId);

      await queryRunner.commitTransaction();

      return {
        message: `Запись подписки с id ${subscriptionId} успешно удалена`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleMethodErrors(error, subscriptionId);
    } finally {
      await queryRunner.release();
    }
  }
}

function handleMethodErrors(error: any, id: number) {
  if (error.status == 404) {
    throw new NotFoundException(`Пользователь с id ${id} не найден`);
  } else {
    throw new InternalServerErrorException('Произошла серверная ошибка');
  }
}
