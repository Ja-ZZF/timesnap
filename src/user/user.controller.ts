import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { setPasswordDto } from './dto/set-password.dto';
import { CurrentUser } from 'src/common/user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('simple')
  async getUserSimple(@CurrentUser('user_id') self_id : number ,@Query('target_id') target_id : number){
    return this.userService.getSimple(self_id,target_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('detail')
  async getUserDetail(@CurrentUser('user_id') self_id : number,@Query('target_id') target_id : number){
    return this.userService.getDetail(self_id,target_id);
  }
  
  @Post('set-password')
  async setPassword(@Body() body : setPasswordDto){
    const {userId,password} = body;
    return this.userService.setPassword(userId,password);
  }


}
