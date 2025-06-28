// src/like/like.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  async create(like: Partial<Like>) {
    // 这里可以加判断，避免重复点赞（根据UNIQUE KEY）
    return this.likeRepo.save(like);
  }

  async remove(likeId: number) {
    return this.likeRepo.delete(likeId);
  }

  async findAll(): Promise<Like[]> {
    return this.likeRepo.find();
  }

  async toggleLike(userId : number , targetType:'Post' | 'Comment', targetId : number): Promise<boolean>{
    const existing = await this.likeRepo.findOne({
      where:{user_id:userId,target_type:targetType,target_id:targetId},
    });

    if(existing){
      await this.likeRepo.remove(existing);
      return false;
    }else{
      const like = this.likeRepo.create({user_id : userId,target_type:targetType,target_id:targetId});
      await this.likeRepo.save(like);
      return true;
    }
  }

}
