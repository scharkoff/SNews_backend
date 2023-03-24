import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

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
}
