import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CommentModule } from '../comment/comment.module';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { FollowModule } from 'src/follow/follow.module';
import { LikeModule } from 'src/like/like.module';
import { CollectService } from 'src/collect/collect.service';
import { PostTagModule } from 'src/post_tag/post_tag.module';
import { CollectModule } from 'src/collect/collect.module';
import { RecommendationModule } from 'src/recommendation/recommendation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => CommentModule), // 互相导入时用 forwardRef 包裹
    forwardRef(() => UserModule),
    MediaModule,
    FollowModule,
    LikeModule,
    CollectModule,
    PostTagModule,
    RecommendationModule,
    
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
