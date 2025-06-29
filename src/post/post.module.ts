// src/post/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CommentService } from 'src/comment/comment.service';
import { CommentModule } from 'src/comment/comment.module';
import { UserModule } from 'src/user/user.module';
import { MediaModule } from 'src/media/media.module';
import { LikeModule } from 'src/like/like.module';
import { Follow } from 'src/follow/entities/follow.entity';
import { FollowModule } from 'src/follow/follow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    CommentModule,
    UserModule,
    MediaModule,
    LikeModule,
    FollowModule,
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
