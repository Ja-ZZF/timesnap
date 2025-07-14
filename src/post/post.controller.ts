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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';
import { CreatePost } from './dto/create-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createStorageOption } from 'src/common/storage';
import { getTime } from 'date-fns';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('simple')
  async getSimple(
    @CurrentUser('user_id') self_id: number,
    @Body('post_ids') post_ids: number[],
  ) {
    return this.postService.getPostsSimple(self_id, post_ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('simple_all')
  async getSimpleAll(
    @CurrentUser('user_id') self_id : number,
  ){
    const post_ids : number[] = await this.postService.getPostIdList();
    return this.postService.getPostsSimple(self_id,post_ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('detail')
  async getDetail(
    @CurrentUser('user_id') self_id: number,
    @Query('post_id') post_id: number,
  ) {
    return this.postService.getPostDetail(self_id, post_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
    @UseInterceptors(FilesInterceptor('images', 9, {
    storage: createStorageOption('posts'),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async addPost(
    @CurrentUser('user_id') self_id : number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body : CreatePost
  ){
    return this.postService.addPost(self_id,body,files);
  }
}
