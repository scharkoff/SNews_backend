import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
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
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.repository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.repository.delete(id);
  }
}
