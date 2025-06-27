// src/comment/entities/comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';


@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  comment_id: number;

  @Column({ type: 'bigint' })
  post_id: number;

  @Column({ type: 'bigint', nullable: true })
  parent_comment_id: number | null;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'datetime', name: 'comment_time' })
  comment_time: Date;

  @Column({type:'int',default:0})
  like_count : number;

  // 关联：评论所属用户
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 关联：评论所属帖子
  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  // 关联：父评论（自己引用自己）
  @ManyToOne(() => Comment, comment => comment.children, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent: Comment;

  // 关联：子评论（自己引用自己）
  @OneToMany(() => Comment, comment => comment.parent)
  children: Comment[];
}

