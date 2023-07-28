import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByCondition({
      email,
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: UserEntity) {
    const { password, ...userData } = user;

    const payload = { email: user.email, id: user.id };

    return {
      userData,
      token: this.jwtService.sign(payload),
    };
  }

  async register(user: CreateUserDto) {
    const saltOrRounds = 10;

    user.password = await bcrypt.hash(user.password, saltOrRounds);

    const isLoginExists = await this.checkIfLoginExists(user.login);
    const isEmailExists = await this.checkIfEmailExists(user.email);

    if (isEmailExists) {
      throw new HttpException(
        'Пользователь с данной почтой уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isLoginExists) {
      throw new HttpException(
        'Пользователь с данным логином уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password, ...userData } = await this.userService.create(user);

    return {
      userData,
      token: this.jwtService.sign(userData),
    };
  }

  async checkIfLoginExists(login: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOneBy({
      login,
    });
    return Boolean(existingUser);
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOneBy({
      email,
    });
    return Boolean(existingUser);
  }
}
