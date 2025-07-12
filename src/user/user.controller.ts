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
import { use } from 'passport';
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
  async getSimple(@CurrentUser('user_id') self_id : number ,@Query('target_id') target_id : number){
    return this.userService.getSimple(self_id,target_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('detail')
  async getDetail(@CurrentUser('user_id') self_id : number,@Query('target_id') target_id : number){
    return this.userService.getDetail(self_id,target_id);
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  @Get(':id/mine')
  async getMinePageInfo(@Param('id') id: string) {
    return this.userService.getMinePageInfo(+id);
  }

  @Post('set-password')
  async setPassword(@Body() body : setPasswordDto){
    const {userId,password} = body;
    return this.userService.setPassword(userId,password);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }

  @Get(':id/posts')
  async getMyPosts(@Param('id') id: string) {
    return this.userService.getMyPosts(+id);
  }

  @Get(':id/collections')
  async getMyCollections(@Param('id') id: string) {
    return this.userService.getMyCollections(+id);
  }

  @Get(':id/likes')
  async getMyLikes(@Param('id') id: string) {
    return this.userService.getMyLikes(+id);
  }
}
