// src/comment/comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}


  findAll(): Promise<Comment[]> {
    //console.log('1111');
    return this.commentRepo.find();
  }

  async create(createDto: CreateCommentDto): Promise<Comment> {
    const { post_id, parent_comment_id, user_id, content } = createDto;

    // 校验帖子存在
    const post = await this.postRepo.findOneBy({ post_id });
    if (!post) throw new NotFoundException('Post not found');

    // 校验用户存在
    const user = await this.userRepo.findOneBy({ user_id });
    if (!user) throw new NotFoundException('User not found');

    // 如果是子评论，校验父评论存在
    let parent: Comment | null =null;
    if (parent_comment_id) {
      parent = await this.commentRepo.findOneBy({ comment_id: parent_comment_id });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepo.create({
      post_id,
      parent_comment_id: parent_comment_id || null,
      user_id,
      content,
    });

    return this.commentRepo.save(comment);
  }

  async getCommentsTreeByPostId(postId : number): Promise<CommentTree[]>{
    const allComments = await this.commentRepo.find({
      where:{post_id : postId},
      order:{comment_time:'ASC'},
    });

    return this.buildTree(allComments);
  }

    private buildTree(comments: Comment[], parentId: number | null = null): CommentTree[] {
    return comments
      .filter(c => c.parent_comment_id === parentId)
      .map(c => ({
        ...c,
        children: this.buildTree(comments, c.comment_id),
      }));
    }

}

type CommentTree = Comment & { children: CommentTree[] };
