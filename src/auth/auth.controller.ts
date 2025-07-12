import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { privateDecrypt } from 'crypto';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RegisterRequest } from './dto/register-requester.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
) {}

  // 登录接口，使用本地策略验证
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() body : RegisterRequest){
    return this.authService.register(body);
  }
}
