// src/comment/comment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Post } from 'src/post/entities/post.entity'
import { User } from 'src/user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Comment,Post,User])], // ✅ 关键
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService], // 可选：如果其他模块也要用 CommentService
})
export class CommentModule {}
