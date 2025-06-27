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

  async getPostDetail(postId : number):Promise<any>{
    const post = await this.dataSource.query(`SELECT * FROM post WHERE post_id = ?`,[postId]);
    if(post.length == 0){
      throw new NotFoundException('Post Not Found');
    }

    const images = await this.dataSource.query(`
      SELECT media_id,url FROM media
      WHERE owner_type = 'Post' AND owner_id = ?  
    `,[postId]);

    const commentsTree = await this.commentService.getCommentsTreeByPostId(postId);

    return{
      ...post[0],
      images,
      comments:commentsTree
    };
  }

}
