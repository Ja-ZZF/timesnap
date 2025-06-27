// src/post/post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ManyToMany, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { NotFoundError } from 'rxjs';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private dataSource : DataSource,
    private readonly commentService: CommentService,
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
    //查询笔记信息
    const post = await this.dataSource.query(`SELECT * FROM post WHERE post_id = ?`,[postId]);
    if(post.length == 0){
      throw new NotFoundException('Post Not Found');
    }

    //查询图片信息
    const images = await this.dataSource.query(`
      SELECT media_id,url FROM media
      WHERE owner_type = 'Post' AND owner_id = ?  
    `,[postId]);
    
    //查询评论树
    const commentsTree = await this.commentService.getCommentsTreeByPostId(postId);

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
    const isLiked = likeResult.length > 0;
    const isCollected = collectResult.length > 0;

    //查询 tag
    const tags = await this.dataSource.query(
      `
      SELECT t.name
      FROM tag t
      INNER JOIN post_tag pt ON t.tag_id = pt.tag_id
      WHERE pt.post_id = ?
      `,
      [postId],
    );

    return{
      ...post[0],
      isLiked,
      isCollected,
      tags,
      images,
      comments:commentsTree
    };
  }

}
