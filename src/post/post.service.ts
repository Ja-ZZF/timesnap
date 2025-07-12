// src/post/post.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
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
    private readonly collectService : CollectService,
    private readonly postTagService : PostTagService,
    private readonly redisService: RedisService, // ✅ 注入 Redis
  ) {}

  async findAll(): Promise<Post[]> {
    const sql = 'SELECT * FROM post';
    return this.dataSource.query(sql);
  }

  async findOne(id: number): Promise<Post | null> {
    const sql = 'SELECT * FROM post WHERE post_id = ?';
    const result = await this.dataSource.query(sql, [id]);
    return result[0] ?? null;
  }

  async findByUserId(userId: number): Promise<Post[]> {
    const sql = `
      SELECT * FROM post
      WHERE user_id = ?
      ORDER BY publish_time DESC
    `;
    return this.dataSource.query(sql, [userId]);
  }

  async findByUserIds(userIds: number[]): Promise<number[]> {
    if (!userIds || userIds.length == 0) return [];

    const posts = await this.postRepo.find({
      where: { user_id: In(userIds) },
      select: ['post_id'],
    });

    return posts.map((post) => post.post_id);
  }

  async create(postData: Partial<Post>): Promise<Post> {
    return this.dataSource.transaction(async (manager) => {
      const sql = `
        INSERT INTO post (user_id,title,content)
        VALUES(?,?,?)
      `;
      const params = [postData.user_id, postData.title, postData.content];

      const result = await manager.query(sql, params);

      const insertedId = result.insertId;

      const insertedRows = await manager.query(
        'SELECT * FROM post WHERE post_id = ?',
        [insertedId],
      );
      return insertedRows[0];
    });
  }

  async update(id: number, postData: Partial<Post>): Promise<Post | null> {
    await this.postRepo.update(id, postData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.postRepo.delete(id);
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
    };

    return postSimple;
  }

  //查询post具体数据
  async getPostDetail(self_id: number, post_id: number): Promise<PostDetail> {
    const postSimple = await this.getPostSimple(self_id,post_id);

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

    const collectStats : CollectStats = {
      collect_count : post.collect_count,
      is_collected : await this.collectService.isCollected(self_id,post_id),
    }

    const tags : TagSimple[] = await this.postTagService.getSimple(post_id);
    const comments : CommentSimple[] = await this.commentService.getPostCommentSimple(self_id,post_id);

    const postDetail : PostDetail = {
      post_simple : postSimple,
      content : post.content,
      medias : medias,
      permission : permission,
      publish_time : post.publish_time,
      collect_stats : collectStats,
      browse_count : post.browse_count,
      comment_count : post.comment_count,
      tags : tags,
      comments : comments,
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
}
