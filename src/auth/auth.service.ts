import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from './dto/register-requester.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
      user_id: user.user_id,
    };
  }

  // src/auth/auth.service.ts
  async register(
    registerDto: RegisterRequest,
  ): Promise<{ access_token: string; user_id: number }> {
    const { email, password, nickname } = registerDto;

    // 检查是否已注册
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new Error('该邮箱已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = await this.userService.createUser({
      email,
      password: hashedPassword,
      nickname: nickname || '未命名用户',
    });

    // 登录并返回 token
    const payload = { username: newUser.email, sub: newUser.user_id };
    return {
      access_token: this.jwtService.sign(payload),
      user_id: newUser.user_id,
    };
  }
}
