import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as PassportLocalStrategy, IStrategyOptions } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(PassportLocalStrategy, 'local') {
  constructor(private authService: AuthService) {
    const options: IStrategyOptions = {
      usernameField: 'email',   // 如果登录字段是 email
      passwordField: 'password', // 这行可写可不写，默认是 'password'
    };
    super(options);
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return user;  // passport 会把这个 user 赋给 req.user
  }
}
