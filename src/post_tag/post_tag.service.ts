// src/post-tag/post-tag.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostTag } from './entities/post_tag.entity';

@Injectable()
export class PostTagService {
  constructor(
    @InjectRepository(PostTag)
    private readonly postTagRepo: Repository<PostTag>,
  ) {}

  create(data: Partial<PostTag>) {
    return this.postTagRepo.save(data);
  }

  findAll() {
    return this.postTagRepo.find();
  }

  findByPost(postId: number) {
    return this.postTagRepo.find({ where: { post_id: postId }, relations: ['tag'] });
  }

  remove(id: number) {
    return this.postTagRepo.delete(id);
  }
}
