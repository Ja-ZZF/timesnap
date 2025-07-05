import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
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

  @Post()
  create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
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
