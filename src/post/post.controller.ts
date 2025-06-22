// src/post/post.controller.ts
import { Controller, Get, Post as HttpPost, Put, Delete, Param, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entities/post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    const post = await this.postService.findOne(+id);
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    return post;
  }

  @Get('user/:userId')
  findByUserId(@Param('userId',ParseIntPipe) userId : number){
    return this.postService.findByUserId(userId);
  }

  @HttpPost()
  create(@Body() postData: Partial<PostEntity>): Promise<PostEntity> {
    return this.postService.create(postData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() postData: Partial<PostEntity>): Promise<PostEntity> {
    //return this.postService.update(+id, postData);
    const post = await this.postService.update(+id,postData);
    if(!post){
        throw new NotFoundException(`Post ${id} not found`);
    }else{
        return post;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.postService.remove(+id);
  }
}
