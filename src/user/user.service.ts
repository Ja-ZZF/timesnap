import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBasicInfo } from './dto/user-basic-info.dto';
import { FollowService } from '../follow/follow.service';
import { LikeService } from '../like/like.service';
import { CollectService } from '../collect/collect.service';
import { PostService } from '../post/post.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private followService: FollowService,
    private likeService: LikeService,
    private collectService: CollectService,
    @Inject(forwardRef(() => PostService)) private postService: PostService,
    private mediaService: MediaService,
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

  async getMinePageInfo(userId: number) {
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 粉丝数
    const followers = await this.followService.findFollowers(userId);
    // 关注数
    const followees = await this.followService.findFollowings(userId);
    // 获赞数（被点赞的总数）
    const likes = await this.likeService.findAll();
    const like_count = likes.filter(like => like.target_type === 'Post' && like.target_id && like.user_id === userId).length;
    // 收藏数
    const collects = await this.collectService.findByUser(userId);

    return {
      user_id: user.user_id,
      avatar: user.avatar,
      name: user.nickname,
      introduction: user.location || '', // 暂用 location 字段做简介
      follower_count: followers.length,
      followee_count: followees.length,
      like_count: like_count,
      collect_count: collects.length,
    };
  }

  // 我的发布
  async getMyPosts(userId: number) {
    const posts = await this.postService.findByUserId(userId);
    const result: {
      id: number;
      image: string | null;
      title: string;
      avatar: string;
      username: string;
      likes: number;
      isLiked: boolean;
    }[] = [];
    for (const post of posts) {
      // 获取首图
      const medias = await this.mediaService.findByOwner('Post', post.post_id);
      const image = medias.length > 0 ? medias[0].url : null;
      // 作者信息
      const user = await this.getBasicUserInfo(post.user_id);
      // 点赞数
      const likes = post.like_count || 0;
      // 是否被自己点赞
      // 这里假设"我的发布"页面不需要 isLiked 字段（如需可补充）
      result.push({
        id: post.post_id,
        image,
        title: post.title,
        avatar: user.avatar,
        username: user.nickname,
        likes,
        isLiked: false, // 可根据需要补充
      });
    }
    return result;
  }

  // 我的收藏
  async getMyCollections(userId: number) {
    const collects = await this.collectService.findByUser(userId);
    const result: {
      id: number;
      image: string | null;
      title: string;
      avatar: string;
      username: string;
      likes: number;
      isLiked: boolean;
    }[] = [];
    for (const collect of collects) {
      const post = await this.postService.findOne(collect.post_id);
      if (!post) continue;
      const medias = await this.mediaService.findByOwner('Post', post.post_id);
      const image = medias.length > 0 ? medias[0].url : null;
      const user = await this.getBasicUserInfo(post.user_id);
      const likes = post.like_count || 0;
      // 是否被自己点赞
      const like = await this.likeService.findAll();
      const isLiked = like.some(l => l.user_id === userId && l.target_type === 'Post' && l.target_id === post.post_id);
      result.push({
        id: post.post_id,
        image,
        title: post.title,
        avatar: user.avatar,
        username: user.nickname,
        likes,
        isLiked,
      });
    }
    return result;
  }

  // 我的点赞
  async getMyLikes(userId: number) {
    const likes = await this.likeService.findAll();
    const myLikes = likes.filter(l => l.user_id === userId && l.target_type === 'Post');
    const result: {
      id: number;
      image: string | null;
      title: string;
      avatar: string;
      username: string;
      likes: number;
      isLiked: boolean;
    }[] = [];
    for (const like of myLikes) {
      const post = await this.postService.findOne(like.target_id);
      if (!post) continue;
      const medias = await this.mediaService.findByOwner('Post', post.post_id);
      const image = medias.length > 0 ? medias[0].url : null;
      const user = await this.getBasicUserInfo(post.user_id);
      const likeCount = post.like_count || 0;
      // 是否被自己点赞（恒为 true）
      result.push({
        id: post.post_id,
        image,
        title: post.title,
        avatar: user.avatar,
        username: user.nickname,
        likes: likeCount,
        isLiked: true,
      });
    }
    return result;
  }
}
