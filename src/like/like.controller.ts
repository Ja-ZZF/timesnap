// src/like/like.controller.ts
import { Controller, Post, Delete, Body, Param, Get } from '@nestjs/common';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get()
  findAll():Promise<Like[]>{
    return this.likeService.findAll();
  }

  @Post()
  create(@Body() like: Partial<Like>) {
    return this.likeService.create(like);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.likeService.remove(+id);
  }
}
