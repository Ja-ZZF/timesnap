// src/post-tag/post-tag.controller.ts
import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { PostTagService } from './post_tag.service';
import { PostTag } from './entities/post_tag.entity';

@Controller('post_tags')
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

  @Post()
  create(@Body() data: Partial<PostTag>) {
    return this.postTagService.create(data);
  }

  @Get()
  findAll() {
    return this.postTagService.findAll();
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: number) {
    return this.postTagService.findByPost(postId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postTagService.remove(id);
  }
}
