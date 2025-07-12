import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, NumericType, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBasicInfo } from './dto/user-basic-info.dto';
import { FollowService } from '../follow/follow.service';
import { LikeService } from '../like/like.service';
import { CollectService } from '../collect/collect.service';
import { PostService } from '../post/post.service';
import { MediaService } from '../media/media.service';
import { RedisService } from 'src/redis/redis.service';
import { UserItem } from './interface/user-item.interface';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSimple } from './dto/user-simple.dto';
import { UserDetail } from './dto/user-detail.dto';
import { FollowStats } from 'src/follow/dto/follow-stats.dto';

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
    private readonly redisService: RedisService, // ✅ 注入 Redis
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
  async getBasicUserInfo(
    userId: number,
  ): Promise<{ user_id: number; nickname: string; avatar: string }> {
    const cacheKey = `user:basic:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const user = await this.userRepo.findOne({
      where: { user_id: userId },
      select: ['user_id', 'nickname', 'avatar'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ 缓存结果，过期时间 300 秒（5 分钟）
    await this.redisService.set(cacheKey, JSON.stringify(user), 300);

    return user;
  }

  async getBasicUserInfoByIds(userIds: number[]): Promise<UserBasicInfo[]> {
    if (userIds.length === 0) return [];

    return this.userRepo.find({
      where: { user_id: In(userIds) },
      select: ['user_id', 'nickname', 'avatar'], // 只选需要的字段
    });
  }

  async getUserItem(userId: number): Promise<UserItem> {
    console.log('userId = ', userId);
    const user = await this.userRepo.findOne({
      where: { user_id: userId },
    });
    console.log(user);
    if (user) {
      const userItem: UserItem = {
        user_id: user.user_id.toString(),
        avatar: user.avatar,
        name: user.nickname,
      };
      return userItem;
    } else {
      throw new NotFoundException('用户未找到');
    }
  }

  async getMinePageInfo(userId: number) {
    const cacheKey = `user:minepage:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const followers = await this.followService.findFollowers(userId);
    const followees = await this.followService.findFollowings(userId);
    const likes = await this.likeService.findAll();
    const like_count = likes.filter(
      (like) =>
        like.target_type === 'Post' &&
        like.target_id &&
        like.user_id === userId,
    ).length;
    const collects = await this.collectService.findByUser(userId);

    const result = {
      user_id: user.user_id,
      avatar: user.avatar,
      name: user.nickname,
      introduction: user.location || '',
      follower_count: followers.length,
      followee_count: followees.length,
      like_count: like_count,
      collect_count: collects.length,
    };

    // ✅ 写入缓存，过期 2 分钟
    await this.redisService.set(cacheKey, JSON.stringify(result), 120);

    return result;
  }

  // 我的发布
  async getMyPosts(userId: number) {
    const cacheKey = `user:myposts:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

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
      const medias = await this.mediaService.findByOwner('Post', post.post_id);
      const image = medias.length > 0 ? medias[0].url : null;
      const user = await this.getBasicUserInfo(post.user_id);
      const likes = post.like_count || 0;

      result.push({
        id: post.post_id,
        image,
        title: post.title,
        avatar: user.avatar,
        username: user.nickname,
        likes,
        isLiked: false,
      });
    }

    await this.redisService.set(cacheKey, JSON.stringify(result), 60); // 缓存 60 秒
    return result;
  }

  // 我的收藏
  async getMyCollections(userId: number) {
    const cacheKey = `user:mycollections:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const collects = await this.collectService.findByUser(userId);
    const allLikes = await this.likeService.findAll(); // ✅ 提前查，避免每个 post 重复查
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

      const isLiked = allLikes.some(
        (l) =>
          l.user_id === userId &&
          l.target_type === 'Post' &&
          l.target_id === post.post_id,
      );

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

    await this.redisService.set(cacheKey, JSON.stringify(result), 60); // 缓存 60 秒
    return result;
  }

  // 我的点赞
  async getMyLikes(userId: number) {
    const cacheKey = `user:mylikes:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const likes = await this.likeService.findAll();
    const myLikes = likes.filter(
      (l) => l.user_id === userId && l.target_type === 'Post',
    );

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

      result.push({
        id: post.post_id,
        image,
        title: post.title,
        avatar: user.avatar,
        username: user.nickname,
        likes: likeCount,
        isLiked: true, // 恒为 true
      });
    }

    await this.redisService.set(cacheKey, JSON.stringify(result), 60); // 缓存 60 秒
    return result;
  }

  async findByEmail(eamil: string): Promise<User | null> {
    // 你用的phone/email/nickname都可以改为合适字段，这里假设用email登录
    return this.userRepo.findOne({ where: { email: eamil } });
  }

  // ✅ 设置新密码（会自动加密）
  async setPassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await this.userRepo.save(user);
  }

  //获取用户简单信息
  async getSimple(self_id: number, target_id: number): Promise<UserSimple> {
    // console.log('self_id = ', self_id);
    // console.log('target_id = ', target_id);

    const targetUser = await this.userRepo.findOne({
      where: { user_id: target_id },
      select: ['user_id', 'avatar', 'nickname', 'email'],
    });

    if (!targetUser) {
      throw new NotFoundException('用户未找到');
    }

    const isFollowed = await this.followService.isFollowed(self_id, target_id);

    const userSimple: UserSimple = {
      user_id: targetUser.user_id,
      avatar: targetUser.avatar,
      nickname: targetUser.nickname,
      email: targetUser.email,
      is_followed: isFollowed,
    };

    return userSimple;
  }

  //批量获取用户简单信息
  async getSimpleBatch(self_id: number, target_ids: number[]): Promise<Map<number, UserSimple>> {
  if (target_ids.length === 0) return new Map();

  // 1. 批量获取用户基本信息
  const users = await this.userRepo.find({
    where: target_ids.map(id => ({ user_id: id })),
    select: ['user_id', 'avatar', 'nickname', 'email'],
  });

  // 2. 批量查询 follow 表（self_id -> target_ids）
  const follows = await this.followService.isFollowedBatch(self_id, target_ids);
  const followedSet = new Set(follows.map(f => f.followed_user_id));

  // 3. 构造 Map<user_id, UserSimple>
  const result = new Map<number, UserSimple>();
  for (const user of users) {
    result.set(user.user_id, {
      user_id: user.user_id,
      avatar: user.avatar,
      nickname: user.nickname,
      email: user.email,
      is_followed: followedSet.has(user.user_id),
    });
  }

  return result;
}


  //获取用户详细信息
  async getDetail(self_id: number, target_id: number): Promise<UserDetail> {
    const targetUser = await this.userRepo.findOne({
      where: { user_id: target_id },
    });

    if (!targetUser) {
      throw new NotFoundException('用户未找到');
    }

    const isFollowed = await this.followService.isFollowed(self_id, target_id);

    const userSimple: UserSimple = {
      user_id: targetUser.user_id,
      avatar: targetUser.avatar,
      nickname: targetUser.nickname,
      email: targetUser.email,
      is_followed: isFollowed,
    };

    const likeCount = await this.postService.getLikeCount(target_id);
    const collectCount = await this.postService.getCollectCount(target_id);

    const followStats: FollowStats = {
      followee_count: targetUser.followed_count,
      follower_count: targetUser.follower_count,
    };

    const userDetail: UserDetail = {
      user_simple: userSimple,
      introduction: '没有简介',
      follow_stats: followStats,
      like_count: likeCount,
      collect_count: collectCount,
    };

    return userDetail;
  }

  //创建新用户
  async createUser(data: {
    email: string;
    password: string;
    nickname: string;
  }): Promise<User> {
    const user = this.userRepo.create({
      email: data.email,
      password: data.password,
      nickname: data.nickname,
      phone: '', // 可设为空或默认值
      location: '',
      gender: 'Other',
      avatar: '',
    });
    return this.userRepo.save(user);
  }
}
