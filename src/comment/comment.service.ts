// src/comment/comment.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { UserBasicInfo } from 'src/user/dto/user-basic-info.dto';
import { UserService } from 'src/user/user.service';
import { MediaService } from 'src/media/media.service';
import { RedisService } from 'src/redis/redis.service';
import { CommentSimple } from './dto/comment-simple.dto';
import { LikeService } from 'src/like/like.service';
import { LikeStats } from 'src/like/dto/like-stats.dto';

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
    private readonly likeService: LikeService,
    private readonly redisService: RedisService, // ✅ 注入 Redis
  ) {}


  //普通查询某评论的所有评论
  async getCommentSimple(
    self_id: number,
    comment_id: number,
  ): Promise<CommentSimple> {
    const comment = await this.commentRepo.findOne({
      //获取评论本体
      where: { comment_id: comment_id },
    });

    if (!comment) {
      throw new NotFoundException('评论未找到');
    }

    const commenter = await this.userService.getSimple(
      self_id,
      comment.user_id,
    ); //获取评论者
    const medias = await this.mediaService.getSimple('Comment', comment_id); //获取评论的media信息
    const isLiked = await this.likeService.isLiked(
      self_id,
      'Comment',
      comment_id,
    ); //获取是否点赞
    const likeStats: LikeStats = {
      //构造stats
      like_count: comment.like_count,
      is_liked: isLiked,
    };

    const childComments = await this.commentRepo.find({
      //构造子评论
      where: { parent_comment_id: comment_id },
    });

    const children: CommentSimple[] = [];
    for (const child of childComments) {
      const childSimple = await this.getCommentSimple(
        self_id,
        child.comment_id,
      );
      if (childSimple) {
        children.push(childSimple);
      }
    }

    const commetSimple: CommentSimple = {
      comment_id: comment_id,
      post_id: comment.post_id,
      commenter: commenter,
      content: comment.content,
      medias: medias,
      comment_time: comment.comment_time,
      like_stats: likeStats,
      children: children,
    };

    return commetSimple;
  }

  //快速查询某评论的所有评论
  async getCommentSimpleFast(
    self_id: number,
    comment_id: number,
  ): Promise<CommentSimple> {
    // 1. 查根评论
    const rootComment = await this.commentRepo.findOne({
      where: { comment_id: comment_id },
    });
    if (!rootComment) throw new NotFoundException('评论未找到');

    const postId = rootComment.post_id;

    // 2. 一次性查该帖所有评论（包括 root 的所有子孙评论）
    const allComments = await this.commentRepo.find({
      where: { post_id: postId },
      order: { comment_time: 'ASC' }, // 保证树结构按时间顺序排列
    });

    // 3. 过滤出与 root_comment_id 有关的所有后代（包括自身）
    const validCommentIds = new Set<number>();
    const parentMap = new Map<number, number[]>(); // parent_comment_id -> child_ids

    for (const comment of allComments) {
      if (comment.parent_comment_id !== null) {
        if (!parentMap.has(comment.parent_comment_id)) {
          parentMap.set(comment.parent_comment_id, []);
        }
        parentMap.get(comment.parent_comment_id)!.push(comment.comment_id);
      }
    }

    // 从 root_comment_id 开始递归收集所有 comment_id
    const collectIds = (cid: number) => {
      validCommentIds.add(cid);
      const children = parentMap.get(cid) || [];
      for (const childId of children) {
        collectIds(childId);
      }
    };
    collectIds(rootComment.comment_id);

    const targetComments = allComments.filter((c) =>
      validCommentIds.has(c.comment_id),
    );

    // 4. 批量加载用户、媒体、点赞信息
    const commentIds = targetComments.map((c) => c.comment_id);
    const userIds = targetComments.map((c) => c.user_id);

    const [userMap, mediaMap, likedSet] = await Promise.all([
      this.userService.getSimpleBatch(self_id, userIds), // Map<number, UserSimple>
      this.mediaService.getSimpleBatchForComment(commentIds), // Map<number, MediaSimple[]>
      this.likeService.getLikedCommentIds(self_id, commentIds), // Set<number>
    ]);

    console.log(mediaMap);

    // 5. 构造 comment_id -> CommentSimple
    const simpleMap = new Map<number, CommentSimple>();
    for (const comment of targetComments) {
      console.log('cur_id: ', comment.comment_id);
      simpleMap.set(comment.comment_id, {
        comment_id: comment.comment_id,
        post_id: comment.post_id,
        commenter: userMap.get(comment.user_id)!,
        content: comment.content,
        medias: mediaMap.get(Number(comment.comment_id)) || [],
        comment_time: comment.comment_time,
        like_stats: {
          like_count: comment.like_count,
          is_liked: likedSet.has(comment.comment_id),
        },
        children: [],
      });
    }

    // 6. 构造树结构
    for (const comment of targetComments) {
      const parentId = comment.parent_comment_id;
      if (parentId && simpleMap.has(parentId)) {
        simpleMap
          .get(parentId)!
          .children.push(simpleMap.get(comment.comment_id)!);
      }
    }

    // 7. 返回根节点
    return simpleMap.get(comment_id)!;
  }
  
  //查询某笔记下的所有评论
  async getPostCommentSimple(
    self_id: number,
    post_id: number,
  ): Promise<CommentSimple[]> {
    // 1. 查询该帖子下所有评论，按时间排序
    const allComments = await this.commentRepo.find({
      where: { post_id },
      order: { comment_time: 'ASC' },
    });

    if (allComments.length === 0) {
      return [];
    }

    // 2. 建立 parent -> children 映射
    const parentMap = new Map<number | null, Comment[]>(); // parent_comment_id -> children comments
    for (const comment of allComments) {
      const parentId = comment.parent_comment_id;
      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, []);
      }
      parentMap.get(parentId)!.push(comment);
    }

    // 3. 批量准备数据
    const commentIds = allComments.map((c) => c.comment_id);
    const userIds = allComments.map((c) => c.user_id);

    const [userMap, mediaMap, likedSet] = await Promise.all([
      this.userService.getSimpleBatch(self_id, userIds), // Map<number, UserSimple>
      this.mediaService.getSimpleBatchForComment(commentIds), // Map<number, MediaSimple[]>
      this.likeService.getLikedCommentIds(self_id, commentIds), // Set<number>
    ]);

    console.log('userMap:', userMap);


    // 4. 递归构造树形结构函数
    const buildTree = (parentId: number | null): CommentSimple[] => {
      const children = parentMap.get(parentId) || [];
      return children.map((comment) => ({
        comment_id: comment.comment_id,
        post_id: comment.post_id,
        commenter: userMap.get(comment.user_id)!,
        content: comment.content,
        medias: mediaMap.get(Number(comment.comment_id)) || [],
        comment_time: comment.comment_time,
        like_stats: {
          like_count: comment.like_count,
          is_liked: likedSet.has(comment.comment_id),
        },
        children: buildTree(comment.comment_id),
      }));
    };

    // 5. 返回根节点（即 parent_comment_id 为 null 的评论列表）
    return buildTree(null);
  }

  async addComment(self_id:number,dto : CreateCommentDto){
    const newComment = this.commentRepo.create({
      post_id : dto.post_id,
      parent_comment_id : dto.parent_comment_id,
      user_id : self_id,
      content : dto.content,
    });

    const result = await this.commentRepo.save(newComment);

    if(result){
      return {message:'建立成功'};
    }else{
      throw new Error('建立失败');
    }
  }
}
