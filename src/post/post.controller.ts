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
  UploadedFile,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';
import { CreatePost } from './dto/create-post.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createStorageOption } from 'src/common/storage';
import { getTime } from 'date-fns';
import { AddPostByUrls } from './dto/create-post-by-urls.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  //获取指定笔记
  @UseGuards(AuthGuard('jwt'))
  @Post('simple')
  async getSimple(
    @CurrentUser('user_id') self_id: number,
    @Body('post_ids') post_ids: number[],
  ) {
    return this.postService.getPostsSimple(self_id, post_ids);
  }

  //获取所有笔记（非视频类）
  @UseGuards(AuthGuard('jwt'))
  @Get('simple_all')
  async getSimpleAll(@CurrentUser('user_id') self_id: number) {
    const post_ids: number[] = await this.postService.getPostIdList();
    return this.postService.getPostsSimple(self_id, post_ids);
  }

  //获取笔记详细信息
  @UseGuards(AuthGuard('jwt'))
  @Get('detail')
  async getDetail(
    @CurrentUser('user_id') self_id: number,
    @Query('post_id') post_id: number,
  ) {
    return this.postService.getPostDetail(self_id, post_id);
  }

  //添加普通笔记
  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  @UseInterceptors(
    FilesInterceptor('images', 9, {
      storage: createStorageOption('posts'),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async addPost(
    @CurrentUser('user_id') self_id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreatePost,
  ) {
    return this.postService.addPost(self_id, body, files);
  }

  //根据urls添加笔记
  @UseGuards(AuthGuard('jwt'))
  @Post('add-by-urls')
  async addPostByUrls(
    @CurrentUser('user_id') self_id: number,
    @Body() body: AddPostByUrls,
  ) {
    return this.postService.addPostByUrls(self_id, body);
  }

  //添加视频笔记
  @UseGuards(AuthGuard('jwt'))
  @Post('add-video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: createStorageOption('videos'),
      limits: { fileSize: 100 * 1024 * 1024 }, // 限制100MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only video files are allowed!'), false);
        }
      },
    }),
  )
  async addVideoPost(
    @CurrentUser('user_id') self_id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePost, // 假设你有视频的Post DTO
  ) {
    return this.postService.addVideoPost(self_id, body, file);
  }

  //获取视频类笔记的列表
  @UseGuards(AuthGuard('jwt'))
  @Get('video_list')
  async getVideoPostList(
    @CurrentUser('user_id') self_id: number,
  ): Promise<number[]> {
    return this.postService.getVideoPostIdList();
  }

  //以下所有方法为测试用方法 正式环境可删除
  @UseGuards(AuthGuard('jwt'))
  @Post('interests')
  async getPostIdListByNum(
    @CurrentUser('user_id') self_id : number,
    @Body('num_posts') num_posts: number,
    @Body('is_video') is_video : boolean,
  ) {
    return this.postService.getInterestedPosts(self_id,num_posts,is_video);
  }
}
