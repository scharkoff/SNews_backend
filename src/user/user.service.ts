import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.repository.save(createUserDto);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findByCondition(condition: LoginUserDto) {
    return await this.repository.findOneBy(condition);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.repository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      this.repository.update(id, updateUserDto);

      const updatedUser = await this.repository.findOneBy({ id });

      await queryRunner.commitTransaction();

      return updatedUser;
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
      const user = await this.repository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      this.repository.delete(id);

      await queryRunner.commitTransaction();

      return { message: `Пользователь с id ${id} успешно удален` };
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
    throw new NotFoundException(`Пользователь с id ${id} не найден`);
  } else {
    throw new InternalServerErrorException('Произошла серверная ошибка');
  }
}
