// src/like/like.controller.ts
import { Controller, Post, Delete, Body, Param, Get, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async toggleLike(
    @CurrentUser('user_id') self_id : number,
    @Body('target_type') targetType : 'Post' | 'Comment',
    @Body('target_id') targetId: number,

  ): Promise<{ result: boolean }> {
    const liked = await this.likeService.toggleLike(self_id, targetType,targetId);
    return { result: liked }; // true: 已点赞，false: 取消点赞
  }

}
