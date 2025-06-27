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

async getCommentsWithUserInfoAndMediasByPostId(postId: number): Promise<any[]> {
  // 查询所有评论
  const allComments = await this.commentRepo.find({
    where: { post_id: postId },
    order: { comment_time: 'ASC' },
  });

  const userIds = Array.from(new Set(allComments.map(c => c.user_id)));
  const users = await this.userService.getBasicUserInfoByIds(userIds);
  const userMap = new Map<number, any>();
  users.forEach(user => userMap.set(user.user_id, user));

  // 先拿到所有评论id
  const commentIds = allComments.map(c => c.comment_id);

  // 用 Promise.all 并行批量获取每条评论的media
  // 注意这里是多条评论，每条调用一次mediaService，开销大时可优化
  const mediasArr = await Promise.all(
    commentIds.map(id => this.mediaService.findByOwner('Comment', id))
  );

  // mediasArr 和 commentIds 对应，把 medias映射到对应评论id
  const mediaMap = new Map<number, any[]>();
  commentIds.forEach((id, index) => {
    mediaMap.set(id, mediasArr[index]);
  });

  // 组装结果
  return allComments.map(comment => ({
    ...comment,
    user: userMap.get(comment.user_id) || null,
    medias: mediaMap.get(comment.comment_id) || [],
  }));
}




// private buildTreeWithUser(
//   comments: Comment[],
//   userMap: Map<number, UserBasicInfo>,
//   parentId: number | null = null,
// ): CommentTree[] {
//   return comments
//     .filter(c => c.parent_comment_id === parentId)
//     .map(c => ({
//       ...c,
//       user: userMap.get(c.user_id) ?? null,
//       children: this.buildTreeWithUser(comments, userMap, c.comment_id),
//     }));
// }


}

type CommentTree = Comment & { children: CommentTree[] };
