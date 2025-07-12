// src/comment/entities/comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';



@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'int' })
  comment_id: number;

  @Column({ type: 'int' })
  post_id: number; //所属的post的id

  @Column({ type: 'int', nullable: true })
  parent_comment_id: number | null; //父评论id

  @Column({ type: 'int' }) //评论发布者id
  user_id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'datetime', name: 'comment_time' })
  comment_time: Date;

  @Column({type:'int',default:0}) //点赞数
  like_count : number;

}

