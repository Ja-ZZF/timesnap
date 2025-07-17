import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionEnum, UserAction } from './entities/user-action.entity';
import { In, Repository, TypeORMError } from 'typeorm';
import { PostTag } from 'src/post_tag/entities/post_tag.entity';
import { Tag } from 'src/tag/entities/tag.entity';

@Injectable()
export class UserActionService {
  constructor(
    @InjectRepository(UserAction)
    private userActionRepo: Repository<UserAction>,

    @InjectRepository(PostTag)
    private readonly postTagRepo: Repository<PostTag>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  //获取用户所有行为
  async getByUser(self_id: number, type?: ActionEnum) {
    const whereCondition: any = { user_id: self_id };
    if (type) {
      whereCondition.action_type = type;
    }

    const actions = await this.userActionRepo.find({
      where: whereCondition,
      order: {
        created_at: 'DESC', // 按时间倒序排列，最新的在前
      },
    });

    return actions;
  }

  //添加一条行为
  async addAction(self_id: number, post_id: number, type: ActionEnum) {
    const userAction = this.userActionRepo.create({
      user_id: self_id,
      post_id: post_id,
      action_type: type,
    });

    await this.userActionRepo.save(userAction);
  }

  //获取用户兴趣标签
  async getUserInterestTags(
    user_id: number,
    limit: number = 10,
  ): Promise<{ tag: string; score: number }[]> {
    const actions = await this.userActionRepo.find({
      where: {
        user_id: user_id,
      },
      select: ['post_id', 'action_type'],
    });

    if (!actions.length) return [];

    console.info(actions);

    // 构建动作权重（完整版）
    const actionWeightMap = {
      [ActionEnum.View]: 1,
      [ActionEnum.Comment]: 2,
      [ActionEnum.Like]: 5,
      [ActionEnum.Collect]: 10,
      [ActionEnum.Share]: 8,
    };

    // 统计每个帖子的行为总分
    const postScores = new Map<number, number>();

    for (const action of actions) {
      const weight = actionWeightMap[action.action_type] || 0;
      if (weight > 0) {
        postScores.set(
          action.post_id,
          (postScores.get(action.post_id) || 0) + weight,
        );
      }
    }

    // 获取所有涉及的帖子 ID
    const postIds = Array.from(postScores.keys());

    // 获取这些帖子对应的所有标签
    const postTags = await this.postTagRepo.find({
      where: {
        post_id: In(postIds),
      },
      relations: ['tag'],
    });

    // 统计每个标签的总分
    const tagScores = new Map<string, number>();
    for (const pt of postTags) {
      const tag = pt.tag.name;
      const score = postScores.get(pt.post_id) || 0;
      tagScores.set(tag, (tagScores.get(tag) || 0) + score);
    }

    // 转换为数组并排序
    const result = Array.from(tagScores.entries())
      .map(([tag, score]) => ({ tag, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return result;
  }
}
