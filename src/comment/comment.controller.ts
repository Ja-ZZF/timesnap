// src/comment/comment.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('simple')
  async getSimple(
    @CurrentUser('user_id') self_id: number,
    @Query('comment_id') comment_id: number,
  ) {
    return this.commentService.getCommentSimpleFast(self_id,comment_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('by-postId')
  async getPostSimple(
    @CurrentUser('user_id') self_id :number,
    @Query('post_id') post_id : number,
  ){
    return this.commentService.getPostCommentSimple(self_id,post_id);
  }

  @Post()
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentService.create(createCommentDto);
  }
}
