// src/post/post.controller.ts
import {
  Controller,
  Get,
  Post as HttpPost,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('simple')
  async getSimple(
    @CurrentUser('user_id') self_id: number,
    @Query('post_id') post_id: number,
  ) {
    return this.postService.getPostSimple(self_id, post_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('detail')
  async getDetail(
    @CurrentUser('user_id') self_id: number,
    @Query('post_id') post_id: number,
  ) {
    return this.postService.getPostDetail(self_id, post_id);
  }
}
