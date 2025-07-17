import { Module } from '@nestjs/common';
import { UserActionService } from './user-action.service';
import { UserActionController } from './user-action.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAction } from './entities/user-action.entity';
import { PostTag } from 'src/post_tag/entities/post_tag.entity';
import { Tag } from 'src/tag/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAction,PostTag,Tag])],
  providers: [UserActionService],
  controllers: [UserActionController],
  exports : [UserActionService]
})
export class UserActionModule {}
