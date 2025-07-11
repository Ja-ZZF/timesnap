// src/like/like.controller.ts
import { Controller, Post, Delete, Body, Param, Get } from '@nestjs/common';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  async toggleLike(
    @Body('user_id') userId: number,
    @Body('target_type') targetType : 'Post' | 'Comment',
    @Body('target_id') targetId: number,

  ): Promise<{ result: boolean }> {
    const liked = await this.likeService.toggleLike(userId, targetType,targetId);
    return { result: liked }; // true: 已点赞，false: 取消点赞
  }

}
