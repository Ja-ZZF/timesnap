import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CollectService } from './collect.service';
import { Collect } from './entities/collect.entity';

@Controller('collects')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  async toggleCollect(
    @Body('user_id') userId : number,
    @Body('post_id') postId : number,
  ):Promise<{result:boolean}>{
    const collected = await this.collectService.toggleCollect(userId,postId);
    return {result : collected};
  }

  @Get()
  findAll(): Promise<Collect[]> {
    return this.collectService.findAll();
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id') user_id: number) {
    return this.collectService.findByUser(user_id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.collectService.remove(id);
  }
}
