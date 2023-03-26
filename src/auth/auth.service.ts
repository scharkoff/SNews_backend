import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password_hash: string): Promise<any> {
    const user = await this.userService.findByCondition({
      email,
      password_hash,
    });

    if (user && user.password_hash === password_hash) {
      const { password_hash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: UserEntity) {
    const { password_hash, ...userData } = user;
    const payload = { email: user.email, sub: user.id };

    return {
      userData,
      access_token: this.jwtService.sign(payload),
    };
  }
}
