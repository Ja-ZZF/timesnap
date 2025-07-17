// src/post/post.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  flatten,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Long, ManyToMany, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { NotFoundError } from 'rxjs';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';
import { MediaService } from 'src/media/media.service';
import { RedisService } from 'src/redis/redis.service';
import { LikeService } from 'src/like/like.service';
import { FollowService } from 'src/follow/follow.service';
import * as crypto from 'crypto';
import { LikeStats } from 'src/like/dto/like-stats.dto';
import { PostSimple } from './dto/post-simple.dto';
import { PostDetail } from './dto/post-detail.dto';
import { Permission } from 'src/dto/permission.dto';
import { MediaSimple } from 'src/media/dto/media-simple.dto';
import { CollectStats } from 'src/collect/dto/collect-stats.dto';
import { CollectService } from 'src/collect/collect.service';
import { TagSimple } from 'src/tag/dto/tag-simple.dto';
import { PostTagService } from 'src/post_tag/post_tag.service';
import { CommentSimple } from 'src/comment/dto/comment-simple.dto';
import { UserSimple } from 'src/user/dto/user-simple.dto';
import { CreatePost } from './dto/create-post.dto';
import * as path from 'path';
import * as fs from 'fs';
import { compressVideo } from 'src/common/storage';
import { AddPostByUrls } from './dto/create-post-by-urls.dto';
import { BoolEnum } from 'sharp';
import { RecommendationService } from 'src/recommendation/recommendation.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private dataSource: DataSource,
    private readonly commentService: CommentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly likeService: LikeService,
    private readonly collectService: CollectService,
    private readonly postTagService: PostTagService,
    private readonly redisService: RedisService, // ✅ 注入 Redis
    private readonly recommendationService : RecommendationService
  ) {}

  //查询所有post的post_id组成列表(非视频流)
  async getPostIdList(): Promise<number[]> {
    const posts = await this.postRepo.find({
      select: ['post_id'],
      where: { is_video: false },
    });

    const result = posts.map((post) => post.post_id);

    return result;
  }

  //查询所有viedoPost的post_id 组成列表 (视频流)
  async getVideoPostIdList(): Promise<number[]> {
    const posts = await this.postRepo.find({
      select: ['post_id'],
      where: { is_video: true },
    });

    const result = posts.map((post) => post.post_id);

    return result;
  }

  //查询感兴趣的内容
  async getInterestedPosts(self_id : number,num_posts : number){
    const list : number[] = await this.recommendationService.getRecommendedPosts(self_id,num_posts);
    return this.getPostsSimple(self_id,list);
  }


  //查询post简单数据
  async getPostSimple(self_id: number, post_id: number) {
    const post = await this.postRepo.findOne({
      where: { post_id: post_id },
    });
    if (!post) {
      throw new NotFoundException('笔记未找到');
    }
    const publisher = await this.userService.getSimple(self_id, post.user_id);
    const likeStats: LikeStats = {
      like_count: post.like_count,
      is_liked: await this.likeService.isLiked(self_id, 'Post', post_id),
    };

    const postSimple: PostSimple = {
      post_id: post_id,
      title: post.title,
      publisher: publisher,
      like_stats: likeStats,
      cover_url: post.cover_url,
      is_vedio: post.is_video,
    };

    return postSimple;
  }

  //批量查询post简单数据
  async getPostsSimple(
    self_id: number,
    post_ids: number[],
  ): Promise<PostSimple[]> {
    if (post_ids.length === 0) return [];

    // 查询所有 posts
    const posts = await this.postRepo.findBy({
      post_id: In(post_ids),
    });

    if (posts.length === 0) {
      throw new NotFoundException('未找到相关笔记');
    }

    // 构建 post_id 到 post 的映射
    const postMap = new Map(posts.map((post) => [post.post_id, post]));

    // 查询所有发布者的 user_id 并去重
    const userIds = [...new Set(posts.map((post) => post.user_id))];

    // 获取所有发布者的简略信息
    const userSimpleMap = new Map<number, UserSimple>();
    await Promise.all(
      userIds.map(async (user_id) => {
        const simple = await this.userService.getSimple(self_id, user_id);
        userSimpleMap.set(user_id, simple);
      }),
    );

    // 查询所有点赞状态（并发优化）
    const likeStatuses = await Promise.all(
      post_ids.map((post_id) =>
        this.likeService.isLiked(self_id, 'Post', post_id),
      ),
    );

    // 构建 PostSimple 列表，保持原始顺序
    const postSimples: PostSimple[] = post_ids
      .map((post_id, index) => {
        const post = postMap.get(post_id);
        if (!post) {
          return null;
        }
        return {
          post_id: post.post_id,
          title: post.title,
          publisher: userSimpleMap.get(post.user_id)!,
          like_stats: {
            like_count: post.like_count,
            is_liked: likeStatuses[index],
          },
          cover_url: post.cover_url,
          is_vedio: post.is_video,
        };
      })
      .filter((item): item is PostSimple => item !== null); // 过滤掉未找到的 post

    return postSimples;
  }

  //查询post具体数据
  async getPostDetail(self_id: number, post_id: number): Promise<PostDetail> {
    const postSimple = await this.getPostSimple(self_id, post_id);

    const post = await this.postRepo.findOne({
      where: { post_id: post_id },
    });

    if (!post) {
      throw new NotFoundException('笔记未找到');
    }

    const medias: MediaSimple[] = await this.mediaService.getSimple(
      'Post',
      post_id,
    );

    const permission: Permission = {
      view_permission: post.view_permission,
      comment_permission: post.comment_permission,
    };

    const collectStats: CollectStats = {
      collect_count: post.collect_count,
      is_collected: await this.collectService.isCollected(self_id, post_id),
    };

    const tags: TagSimple[] = await this.postTagService.getSimple(post_id);
    const comments: CommentSimple[] =
      await this.commentService.getPostCommentSimple(self_id, post_id);

    const postDetail: PostDetail = {
      post_simple: postSimple,
      content: post.content,
      medias: medias,
      permission: permission,
      publish_time: post.publish_time,
      collect_stats: collectStats,
      browse_count: post.browse_count,
      comment_count: post.comment_count,
      tags: tags,
      comments: comments,
    };

    return postDetail;
  }

  //获取用户的所有的post的点赞和
  async getLikeCount(user_id: number): Promise<number> {
    const result = await this.postRepo
      .createQueryBuilder('post')
      .select('SUM(post.like_count)', 'like_count_sum')
      .where('post.user_id = :user_id', { user_id })
      .getRawOne();

    return Number(result.like_count_sum) || 0; // 防止 null
  }

  //获取用户的所有的post的收藏和
  async getCollectCount(user_id: number): Promise<number> {
    const result = await this.postRepo
      .createQueryBuilder('post')
      .select('SUM(post.collect_count)', 'collect_count_sum')
      .where('post.user_id = :user_id', { user_id })
      .getRawOne();

    return Number(result.collect_count_sum) || 0; // 防止 null
  }

  //新建一条post
  async addPost(
    self_id: number,
    dto: CreatePost,
    files: Express.Multer.File[],
  ) {
    const post = this.postRepo.create({
      user_id: self_id,
      title: dto.title,
      content: dto.content,
    });

    const savedPost = await this.postRepo.save(post);

    if (!savedPost) {
      throw new Error('创建失败');
    }

    if (files?.length) {
      const firstThumbUrl =
        await this.mediaService.createMediasAndGetFirstThumb(
          files,
          'Post',
          savedPost.post_id,
          'posts',
        );

      if (firstThumbUrl) {
        savedPost.cover_url = firstThumbUrl;
        await this.postRepo.save(savedPost);
      }
    }

    return { message: '创建成功' };
  }

  //新建视频post
  async addVideoPost(
    self_id: number,
    dto: CreatePost,
    file: Express.Multer.File,
  ) {
    const baseUrl = process.env.BASE_URL || '';

    // 压缩输出目录
    const outputDir = path.join('uploads', 'videos', 'compressed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    // 压缩视频
    const compressedPath = await compressVideo(file.path, outputDir);

    // 压缩后的视频 URL
    const compressedUrl = `${baseUrl}/uploads/videos/compressed/${path.basename(compressedPath)}`;

    const post = this.postRepo.create({
      user_id: self_id,
      title: dto.title,
      content: dto.content,
      cover_url: compressedUrl,
      is_video: true,
    });

    const savedPost = await this.postRepo.save(post);

    if (!savedPost) {
      throw new Error('创建失败');
    }

    return { message: '创建成功' };
  }

  //新建一条post by urls
  async addPostByUrls(self_id: number, dto: AddPostByUrls) {
    const urls = dto.urls;

    if (urls.length === 0) {
      throw new Error('图片 urls 不能为空');
    }

    // 假设 urls 是 "/uploads/posts/original/xxx.jpg" 格式，替换 original 为 thumb
    const cover_url = urls[0].replace('/original/', '/thumb/');

    const post = this.postRepo.create({
      user_id: self_id,
      title: dto.title,
      content: dto.content,
      cover_url: cover_url, // 新增封面字段
    });

    const savedPost = await this.postRepo.save(post);

    // 关联媒体，传入原始 urls
    await this.mediaService.createMediasByUrls(savedPost.post_id, urls);

    return savedPost.post_id;
  }
}
