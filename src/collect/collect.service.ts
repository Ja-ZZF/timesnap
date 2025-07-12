import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collect } from './entities/collect.entity';
import { userInfo } from 'os';

@Injectable()
export class CollectService {
  constructor(
    @InjectRepository(Collect)
    private readonly collectRepo: Repository<Collect>,
  ) {}

  create(collect: Partial<Collect>) {
    return this.collectRepo.save(collect);
  }

  findAll() {
    return this.collectRepo.find();
  }

  findByUser(user_id: number) {
    return this.collectRepo.find({ where: { user_id } });
  }

  remove(id: number) {
    return this.collectRepo.delete(id);
  }

  async toggleCollect(userId: number, postId: number): Promise<boolean> {
  try {
    const existing = await this.collectRepo.findOne({ where: { user_id: userId, post_id: postId } });

    if (existing) {
      await this.collectRepo.delete({ user_id: userId, post_id: postId });
      return false;
    } else {
      const collect = this.collectRepo.create({ user_id: userId, post_id: postId });
      await this.collectRepo.save(collect);
      return true;
    }
  } catch (error) {
    // 日志或抛出异常，视需求而定
    throw error;
  }
}
  async isCollected(self_id : number,post_id : number):Promise<boolean>{
    const exists = await this.collectRepo.exists({
      where:{post_id : post_id},
    });
    return exists;
  }



}
