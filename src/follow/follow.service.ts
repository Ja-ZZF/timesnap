import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
  ) {}

  findAll():Promise<Follow[]>{
    return this.followRepo.find();
  }

  create(follow: Partial<Follow>) {
    return this.followRepo.save(follow);
  }

  remove(follow_id: number) {
    return this.followRepo.delete(follow_id);
  }

  async findFollowers(user_id: number) {
    return this.followRepo.find({ where: { followed_user_id: user_id } });
  }

  async findFollowings(user_id: number) {
    return this.followRepo.find({ where: { follower_user_id: user_id } });
  }
}
