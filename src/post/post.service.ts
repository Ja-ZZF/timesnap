// src/post/post.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  findAll(): Promise<Post[]> {
    return this.postRepo.find(); // 联表查用户信息
  }

  findOne(id: number): Promise<Post | null> {
    return this.postRepo.findOne({
      where: { post_id: id },
    });
  }

  async findByUserId(userId:number) : Promise<Post[]>{
    return this.postRepo.find({
        where:{user:{user_id: userId}},
        order:{publish_time:'DESC'}
    });
  }

  async create(postData: Partial<Post>): Promise<Post> {
    const post = this.postRepo.create(postData);
    return this.postRepo.save(post);
  }

  async update(id: number, postData: Partial<Post>): Promise<Post | null> {
    await this.postRepo.update(id, postData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.postRepo.delete(id);
  }
}
