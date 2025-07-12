import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { LikeModule } from 'src/like/like.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User]),
    forwardRef(() => UserModule),
    MediaModule,
    LikeModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}