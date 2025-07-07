import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBasicInfo } from './dto/user-basic-info.dto';
import { FollowService } from '../follow/follow.service';
import { LikeService } from '../like/like.service';
import { CollectService } from '../collect/collect.service';
import { PostService } from '../post/post.service';
import { MediaService } from '../media/media.service';
import { RedisService } from 'src/redis/redis.service';

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
  
}
