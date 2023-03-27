import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { checkErrorCodeAndDetail } from './handlers/CheckErrorCodeAndDetail';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
    try {
      const saltOrRounds = 10;

      user.password = await bcrypt.hash(user.password, saltOrRounds);

      const { password, ...userData } = await this.userService.create(user);

      return {
        userData,
        token: this.jwtService.sign(userData),
      };
    } catch (error) {
      checkErrorCodeAndDetail(error);
    }
  }
}
