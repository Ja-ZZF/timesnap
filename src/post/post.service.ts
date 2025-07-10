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
    private readonly followService: FollowService,
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

  //查询post数据
  async getPostDetail(postId: number, userId: number): Promise<any> {
    const cacheKey = `post:detail:${postId}:user:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log('缓存命中');
      return JSON.parse(cached);
    } else {
      console.log('缓存未命中');
    }

    // 原始逻辑（查询数据库）
    const postResult = await this.dataSource.query(
      `SELECT * FROM post WHERE post_id = ?`,
      [postId],
    );

    if (postResult.length === 0) {
      throw new NotFoundException('Post Not Found');
    }

    const post = postResult[0];

    const author = await this.userService.getBasicUserInfo(post.user_id); // ⚠️这里改回 post.user_id
    const medias = await this.mediaService.findByOwner('Post', postId);
    const commentsTree =
      await this.commentService.getCommentsWithUserInfoAndMediasByPostId(
        postId,
      );

    const likeResult = await this.dataSource.query(
      `
    SELECT 1 FROM \`like\`
    WHERE target_type = 'Post' AND target_id = ? AND user_id = ? LIMIT 1
  `,
      [postId, userId],
    );

    const collectResult = await this.dataSource.query(
      `
    SELECT 1 FROM \`collect\`
    WHERE post_id = ? AND user_id = ? LIMIT 1
  `,
      [postId, userId],
    );

    const tags = await this.dataSource.query(
      `
    SELECT t.tag_id, t.name
    FROM tag t
    INNER JOIN post_tag pt ON t.tag_id = pt.tag_id
    WHERE pt.post_id = ?
  `,
      [postId],
    );

    const result = {
      post: {
        post_id: Number(post.post_id),
        publish_time: post.publish_time,
        title: post.title,
        content: post.content,
      },
      user: author,
      permission: {
        view_permission: post.view_permission,
        comment_permission: post.comment_permission,
      },
      stats: {
        like_count: post.like_count,
        collect_count: post.collect_count,
        browse_count: post.browse_count,
        comment_count: post.comment_count,
        isLiked: likeResult.length > 0,
        isCollected: collectResult.length > 0,
      },
      medias,
      tags,
      comments: commentsTree,
    };

    // ✅ 缓存到 Redis，60 秒过期（可调）
    await this.redisService.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getPostSimple(postIds: number[], userId: number): Promise<any[]> {
    if (!postIds || postIds.length === 0) return [];

    const postIdsKey = crypto
      .createHash('md5')
      .update(postIds.join(','))
      .digest('hex');
    const cacheKey = `post:simple:user:${userId}:posts:${postIdsKey}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`[Redis] 命中 ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`[Redis] 未命中 ${cacheKey}，查询数据库`);

    const posts = await this.postRepo.find({
      where: { post_id: In(postIds) },
      relations: ['user'],
      select: [
        'post_id',
        'content',
        'like_count',
        'user',
        'title',
        'cover_url',
      ],
    });

    const likedSet = await this.likeService.getUserLikedPostIds(
      userId,
      postIds,
    );

    const result = posts.map((post) => ({
      id: post.post_id,
      image: post.cover_url || null,
      title: post.title,
      avatar: post.user.avatar,
      username: post.user.nickname,
      likes: post.like_count,
      isLiked: likedSet.has(Number(post.post_id)),
    }));

    await this.redisService.set(cacheKey, JSON.stringify(result), 300); // 有效期 5 分钟
    return result;
  }

  async getFollowedPostSimple(userId: number): Promise<any[]> {
    const followedUserIds = await this.followService.findFollowedList(userId);

    const followedPostIds = await this.findByUserIds(followedUserIds);

    return this.getPostSimple(followedPostIds, userId);
  }

  async findAllIds() : Promise<number[]>{
    const result = await this.postRepo.find({
      select:['post_id']
    });

    const Ids = result.map(row=>row.post_id);
    return Ids;
  }
}
