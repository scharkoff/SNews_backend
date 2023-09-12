import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repository: Repository<SubscriptionEntity>,
  ) {}

  async create(id: number, followingId: number) {
    const existingSubscription = await this.repository.findOne({
      where: {
        follower: { id },
        following: { id: followingId },
      },
    });

    if (existingSubscription) {
      throw new HttpException(
        'Подписка на пользователя уже существует',
        HttpStatus.CONFLICT,
      );
    }

    const subscription = this.repository.create({
      follower: { id },
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

  async findPopularUsers(skip = 0, take = 10) {
    const result: UserEntity & { subscribers: number }[] =
      await this.repository.query(
        `
      SELECT users.*, COUNT("followingId") as subscribers
      FROM subscriptions
      JOIN users ON users.id = subscriptions."followerId"
      GROUP BY users.id, users.login
      ORDER BY subscribers DESC
      OFFSET $1 LIMIT $2
    `,
        [skip, take],
      );

    return result.map((user) => {
      delete user['password'];
      return user;
    });
  }

  async remove(subscriptionId: number) {
    const subscription = await this.repository.findOneBy({
      id: subscriptionId,
    });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.repository.delete(subscriptionId);

    return {
      message: `Запись подписки с id ${subscriptionId} успешно удалена`,
    };
  }
}
