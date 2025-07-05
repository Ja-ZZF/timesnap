import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FollowModule } from '../follow/follow.module';
import { LikeModule } from '../like/like.module';
import { CollectModule } from '../collect/collect.module';
import { PostModule } from '../post/post.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FollowModule,
    LikeModule,
    CollectModule,
    forwardRef(() => PostModule),
    MediaModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, UserModule],
})
export class UserModule {}
