// src/comment/comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { UserBasicInfo } from 'src/user/dto/user-basic-info.dto';
import { UserService } from 'src/user/user.service';
import { MediaService } from 'src/media/media.service';
import { LikeService } from 'src/like/like.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly userService: UserService,
    private readonly mediaService : MediaService,
    private readonly likeService : LikeService,
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

  private async getAllComments(postId: number) {
    return this.commentRepo.find({
      where: { post_id: postId },
      order: { comment_time: 'ASC' },
    });
  }

  private async getUserMapFromComments(comments: Comment[]): Promise<Map<number, any>> {
    const userIds = Array.from(new Set(comments.map(c => c.user_id)));
    const users = await this.userService.getBasicUserInfoByIds(userIds);
    const map = new Map<number, any>();
    users.forEach(user => map.set(user.user_id, user));
    return map;
  }

  private async getMediaMapFromComments(comments: Comment[]): Promise<Map<number, any[]>> {
    const commentIds = comments.map(c => c.comment_id);
    return this.mediaService.findByOwnerBatch('Comment', commentIds);
  }

  private buildEnrichedComments(
    comments: any[],
    userMap: Map<number, any>,
    mediaMap: Map<number, any[]>,
    likedSet: Set<number>
  ): any[] {
    return comments.map(comment => ({
      ...comment,
      user: userMap.get(comment.user_id) || null,
      medias: mediaMap.get(comment.comment_id) || [],
      isLiked: likedSet.has(comment.comment_id),
      children: []  // 🌳 用于构造树结构
    }));
  }

  private buildCommentTree(enrichedComments: any[]): any[] {
    const commentMap = new Map<number, any>();
    enrichedComments.forEach(c => commentMap.set(c.comment_id, c));

    const root: any[] = [];

    for (const comment of enrichedComments) {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.children.push(comment);
        } else {
          root.push(comment); // 防御性兜底
        }
      } else {
        root.push(comment);
      }
    }

    return root;
  }

async getCommentsWithUserInfoAndMediasByPostId(postId: number, userId?: number): Promise<any[]> {
  const allComments = await this.getAllComments(postId);
  const userMap = await this.getUserMapFromComments(allComments);
  const mediaMap = await this.getMediaMapFromComments(allComments);

  const commentIds = allComments.map(c => c.comment_id); // ✅ 修复这里
  const likedSet = userId
    ? (await this.likeService.getUserLikedCommentIds(userId, commentIds)) as Set<number>
    : new Set<number>();

  const enrichedComments = this.buildEnrichedComments(allComments, userMap, mediaMap, likedSet);
  return this.buildCommentTree(enrichedComments);
}



}

type CommentTree = Comment & { children: CommentTree[] };
