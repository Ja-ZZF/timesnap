// src/comment/comment.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() comment: Partial<Comment>) {
    return this.commentService.create(comment);
  }

  @Get()
  findAll(): Promise<Comment[]> {
    return this.commentService.findAll();
  }

  @Get(':type/:id')
  findByTarget(
    @Param('type') type: 'Post' | 'Comment',
    @Param('id') id: number,
  ) {
    return this.commentService.findByTarget(type, +id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.commentService.remove(+id);
  }
}
