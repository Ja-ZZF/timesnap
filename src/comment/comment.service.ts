// src/comment/comment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  create(comment: Partial<Comment>) {
    return this.commentRepo.save(comment);
  }

  findAll(): Promise<Comment[]> {
    //console.log('1111');
    return this.commentRepo.find();
  }

  findByTarget(type: 'Post' | 'Comment', id: number): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { target_type: type, target_id: id },
    });
  }

  remove(id: number) {
    return this.commentRepo.delete(id);
  }

  // src/comment/comment.service.ts
  async getCommentTreeByPostId(postId: number): Promise<Comment[]> {
    console.log('正在获取 post_id 为', postId, '的根评论');

    const roots = await this.commentRepo.find({
      where: { target_type: 'Post', target_id: postId },
      order: { comment_time: 'ASC' }
    });

    console.log('获取到的根评论:', roots);

    for (const root of roots) {
      root.children = await this.getRepliesRecursive(root.comment_id);
    }

    return roots;
  }


  private async getRepliesRecursive(parentId: number): Promise<Comment[]> {
    const children = await this.commentRepo.find({
      where: { target_type: 'Comment', target_id: parentId },
      order: { comment_time: 'ASC' }
    });

    for (const child of children) {
      child.children = await this.getRepliesRecursive(child.comment_id);
    }

    return children;
  }

}
