// src/comment/comment.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { UserBasicInfo } from 'src/user/dto/user-basic-info.dto';
import { UserService } from 'src/user/user.service';
import { MediaService } from 'src/media/media.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mediaService: MediaService,

    private readonly redisService: RedisService, // ✅ 注入 Redis
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
    let parent: Comment | null = null;
    if (parent_comment_id) {
      parent = await this.commentRepo.findOneBy({
        comment_id: parent_comment_id,
      });
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

  async getCommentsWithUserInfoAndMediasByPostId(
    postId: number,
  ): Promise<any[]> {
    console.log('开始查询缓存...');
    const cacheKey = `post:${postId}:comments:tree`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log('缓存命中');
      return JSON.parse(cached);
    }else{
      console.log('缓存未命中');
    }

    // === 原始逻辑 ===
    const allComments = await this.commentRepo.find({
      where: { post_id: postId },
      order: { comment_time: 'ASC' },
    });

    const userIds = Array.from(new Set(allComments.map((c) => c.user_id)));
    const users = await this.userService.getBasicUserInfoByIds(userIds);
    const userMap = new Map<number, any>();
    users.forEach((user) => userMap.set(user.user_id, user));

    const commentIds = allComments.map((c) => c.comment_id);
    const mediasArr = await Promise.all(
      commentIds.map((id) => this.mediaService.findByOwner('Comment', id)),
    );

    const mediaMap = new Map<number, any[]>();
    commentIds.forEach((id, index) => {
      mediaMap.set(id, mediasArr[index]);
    });

    const enrichedComments = allComments.map((comment) => ({
      ...comment,
      user: userMap.get(comment.user_id) || null,
      medias: mediaMap.get(comment.comment_id) || [],
      children: [],
    }));

    const commentMap = new Map<number, any>();
    enrichedComments.forEach((comment) =>
      commentMap.set(comment.comment_id, comment),
    );

    const rootComments: any[] = [];

    enrichedComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.children.push(comment);
        } else {
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    // ✅ 写入缓存，60 秒
    await this.redisService.set(cacheKey, JSON.stringify(rootComments), 60);
    console.log('缓存已写入，时间60s');

    return rootComments;
  }
}
