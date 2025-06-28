// src/post/post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Long, ManyToMany, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { NotFoundError } from 'rxjs';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private dataSource : DataSource,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly mediaService : MediaService,
  ) {}

  async findAll() : Promise<Post[]>{
    const sql = 'SELECT * FROM post';
    return this.dataSource.query(sql);
  }

  async findOne(id: number): Promise<Post | null> {
    const sql = 'SELECT * FROM post WHERE post_id = ?';
    const result = await this.dataSource.query(sql,[id]);
    return result[0] ?? null;
  }

  async findByUserId(userId:number) : Promise<Post[]>{
    const sql  = `
      SELECT * FROM post
      WHERE user_id = ?
      ORDER BY publish_time DESC
    `;
    return this.dataSource.query(sql,[userId]);
  }

  async create(postData: Partial<Post>): Promise<Post> {
    return this.dataSource.transaction(async(manager)=>{
      const sql = `
        INSERT INTO post (user_id,title,content)
        VALUES(?,?,?)
      `;
      const params = [
        postData.user_id,
        postData.title,
        postData.content,
      ];

      const result = await manager.query(sql,params);

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

  async getPostDetail(postId : number, userId : number):Promise<any>{
    // 查询笔记信息
    const postResult = await this.dataSource.query(
      `SELECT * FROM post WHERE post_id = ?`,
      [postId],
    );
    if (postResult.length === 0) {
      throw new NotFoundException('Post Not Found');
    }
    const post = postResult[0]; // 取出查询结果的第一条

    console.log(post);

    //查询笔记用户基本信息
    const author = await this.userService.getBasicUserInfo(userId);

    //查询图片信息
    const medias = await this.mediaService.findByOwner("Post",postId);
    
    
    //查询评论树
    const commentsTree = await this.commentService.getCommentsWithUserInfoAndMediasByPostId(postId);

    //查询是否点赞
    const likeResult = await this.dataSource.query(`
      SELECT 1 FROM \`like\`
      WHERE target_type = 'Post' AND target_id = ? AND user_id = ? LIMIT 1
    `, [postId, userId]);

    //查询是否收藏
    const collectResult = await this.dataSource.query(`
      SELECT 1 FROM \`collect\`
      WHERE post_id = ? AND user_id = ? LIMIT 1
    `, [postId, userId]);

    //查询 tag
    const tags = await this.dataSource.query(
      `
      SELECT t.tag_id,t.name
      FROM tag t
      INNER JOIN post_tag pt ON t.tag_id = pt.tag_id
      WHERE pt.post_id = ?
      `,
      [postId],
    );

    return {
      post: {
        post_id: Number(post.post_id),
        publish_time: post.publish_time,
        title: post.title,
        content: post.content,
      },
      user: author, // ✅ 加入 user 模块
      permission: {
        view_permission: post.view_permission,
        comment_permission: post.comment_permission,
      },
      stats: {
        like_count: post.like_count,
        collect_count: post.collect_count,
        browse_count: post.browse_count,
        comment_count:post.comment_count,
        isLiked: likeResult.length > 0,
        isCollected: collectResult.length > 0,
      },
      medias,
      tags,
      comments: commentsTree,
    };
  }

  async getPostSimple(postIds: number[]): Promise<any[]> {
    if (!postIds || postIds.length === 0) return [];

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
      WHERE p.post_id IN (${postIds.map(() => '?').join(',')})
    `;

    const result = await this.postRepo.query(sql, postIds);

    console.log(result);

    return result;
  }

}
