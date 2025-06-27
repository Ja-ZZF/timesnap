// src/comment/comment.controller.ts
import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async findAll():Promise<Comment[]>{
    return this.commentService.findAll();
  }

  // @Get(':postId/tree')
  // async getCommentsTree(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.commentService.getCommentsTreeByPostId(postId);
  // }

  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentService.create(createCommentDto);
  }




}
