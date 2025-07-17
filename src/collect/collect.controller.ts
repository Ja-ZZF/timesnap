import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CollectService } from './collect.service';
import { Collect } from './entities/collect.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('collects')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async toggleCollect(
    @CurrentUser('user_id') self_id : number,
    @Body('post_id') postId : number,
  ):Promise<{result:boolean}>{
    const collected = await this.collectService.toggleCollect(self_id,postId);
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
