// src/post/post.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Long, ManyToMany, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { NotFoundError } from 'rxjs';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';
import { MediaService } from 'src/media/media.service';
import { RedisService } from 'src/redis/redis.service';

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
    }else{
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

  async getPostSimple(postIds: number[]): Promise<any[]> {
    if (!postIds || postIds.length === 0) return [];

    const results: any[] = [];

    for (const postId of postIds) {
      const cacheKey = `post:simple:${postId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        results.push(JSON.parse(cached));
        continue;
      }

      const sql = `
      SELECT 
        p.post_id,
        LEFT(p.content, 100) AS content,
        p.like_count,
        u.user_id,
        u.nickname,
        u.avatar,
        m.url AS media_url
      FROM post p
      JOIN user u ON p.user_id = u.user_id
      LEFT JOIN (
        SELECT m1.*
        FROM media m1
        JOIN (
          SELECT owner_id, MIN(media_id) AS min_media_id
          FROM media
          WHERE owner_type = 'Post'
          GROUP BY owner_id
        ) m2 ON m1.media_id = m2.min_media_id
      ) m ON m.owner_id = p.post_id
      WHERE p.post_id = ?
    `;

      const [item] = await this.dataSource.query(sql, [postId]);

      if (item) {
        await this.redisService.set(cacheKey, JSON.stringify(item), 60); // 缓存 60 秒
        results.push(item);
      }
    }

    return results;
  }
}
