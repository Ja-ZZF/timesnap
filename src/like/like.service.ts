// src/like/like.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

    async getUserLikedPostIds(userId: number, postIds: number[]): Promise<Set<number>> {
    if (!postIds || postIds.length === 0) return new Set();

    const likes = await this.likeRepo.find({
      where: {
        user_id: userId,
        target_type: 'Post',
        target_id: In(postIds),
      },
      select: ['target_id'],
    });

    //console.log(likes);

    return new Set(likes.map(like => like.target_id));
  }

  async getUserLikedCommentIds(userId: number, commentIds: number[]): Promise<Set<number>> {
    if (!commentIds || commentIds.length === 0) return new Set();

    const likes = await this.likeRepo.find({
      where: {
        user_id: userId,
        target_type: 'Comment',
        target_id: In(commentIds),
      },
      select: ['target_id'],
    });

    //console.log(likes);

    return new Set(likes.map(like => like.target_id));
  }

}
