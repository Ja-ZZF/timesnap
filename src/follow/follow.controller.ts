import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { FollowService } from './follow.service';
import { Follow } from './entities/follow.entity';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  create(@Body() follow: Partial<Follow>) {
    return this.followService.create(follow);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.followService.remove(id);
  }

  @Get()
  findAll():Promise<Follow[]>{
    return this.followService.findAll();
  }

  @Get('followers/:id')
  getFollowers(@Param('id') id: number) {
    return this.followService.findFollowers(id);
  }

  @Get('followings/:id')
  getFollowings(@Param('id') id: number) {
    return this.followService.findFollowings(id);
  }
  
  @Get('followingsList/:id')
  getFollowingsList(@Param('id') id : number){
    return this.followService.findFollowedList(id);
  }

}
