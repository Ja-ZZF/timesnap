import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBasicInfo } from './dto/user-basic-info.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepo.findOneBy({ user_id: id });
  }

  create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepo.create(user);
    return this.userRepo.save(newUser);
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

  // ✅ 获取用户基础信息
  async getBasicUserInfo(userId: number): Promise<{ user_id: number; nickname: string; avatar: string }> {
    const user = await this.userRepo.findOne({
      where: { user_id: userId },
      select: ['user_id', 'nickname', 'avatar'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getBasicUserInfoByIds(userIds: number[]): Promise<UserBasicInfo[]> {
  if (userIds.length === 0) return [];

  return this.userRepo.find({
    where: { user_id: In(userIds) },
    select: ['user_id', 'nickname', 'avatar'], // 只选需要的字段
  });
  }


}
