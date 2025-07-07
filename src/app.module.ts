import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { MediaModule } from './media/media.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ConversationModule } from './conversation/conversation.module';
import { CollectModule } from './collect/collect.module';
import { BrowseModule } from './browse/browse.module';
import { FollowModule } from './follow/follow.module';
import { TagModule } from './tag/tag.module';
import { PostTagModule } from './post_tag/post_tag.module';
import { ConfigModule } from '@nestjs/config'; // ✅ 导入 ConfigModule
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // ✅ 加载 .env 文件并设为全局配置
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '47.117.0.254',
      port: 3306,
      username: 'harmonyUser',
      password: 'abc123456',
      database: 'timesnap',
      synchronize: false,
      autoLoadEntities: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    UserModule,
    PostModule,
    MediaModule,
    CommentModule,
    LikeModule,
    ConversationModule,
    CollectModule,
    BrowseModule,
    FollowModule,
    TagModule,
    PostTagModule,
    RedisModule,
  ],
})
export class AppModule {}
