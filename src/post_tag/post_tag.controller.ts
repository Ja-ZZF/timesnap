// src/post-tag/post-tag.controller.ts
import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { PostTagService } from './post_tag.service';
import { PostTag } from './entities/post_tag.entity';

@Controller('post_tags')
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

}
