// src/post-tag/post-tag.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostTag } from './entities/post_tag.entity';
import { TagSimple } from 'src/tag/dto/tag-simple.dto';

@Injectable()
export class PostTagService {
  constructor(
    @InjectRepository(PostTag)
    private readonly postTagRepo: Repository<PostTag>,
  ) {}

  async getSimple(post_id : number) : Promise<TagSimple[]>{
    const tags = await this.postTagRepo.find({
      where : {post_id : post_id},
      relations : ['tag'],
    });

    const tagSimples : TagSimple[] = tags.map(pt=>({
      tag_id : pt.tag.tag_id,
      name : pt.tag.name,
    }));

    return tagSimples;
  }
}
