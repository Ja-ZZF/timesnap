import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Follow])],
  providers: [FollowService],
  controllers: [FollowController],
  exports:[FollowService],
})
export class FollowModule {}
