import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
  ) {}


  async findFollowedList(user_id: number): Promise<number[]> {
    const followedUsers = await this.followRepo.find({
      where: { follower_user_id: user_id },
      select: ['followed_user_id'],
    });

    return followedUsers.map((f) => f.followed_user_id);
  }

  async isFollowed(user_1_id : number,user_2_id : number):Promise<boolean>{
    const exists = await this.followRepo.exists({
      where:{
        follower_user_id : user_1_id,
        followed_user_id : user_2_id,
      }
    });
    return exists;
  }

  async isFollowedBatch(self_id: number, target_ids: number[]): Promise<Follow[]> {
  return this.followRepo.find({
    where: {
      follower_user_id: self_id,
      followed_user_id: In(target_ids),
    },
  });
}

}
