// src/post-tag/post-tag.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTag } from './entities/post_tag.entity';
import { PostTagService } from './post_tag.service';
import { PostTagController } from './post_tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostTag])],
  controllers: [PostTagController],
  providers: [PostTagService],
})
export class PostTagModule {}
