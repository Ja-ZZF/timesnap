// src/comment/entities/comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'comment' })
export class Comment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['Post', 'Comment'] })
  target_type: 'Post' | 'Comment';

  @Column()
  target_id: number;

  @Column('text')
  content: string;

  @CreateDateColumn({ type: 'datetime' })
  comment_time: Date;

  @Column({type:'int',default:0})
  like_count : number;

  children?:Comment[];
}
