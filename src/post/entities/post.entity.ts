// src/post/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn()
  post_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  publish_time: Date;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  content: string;

  @Column({type:'int',default:0})
  like_count : number;

  @Column({type:'int',default:0})
  collect_count : number;

  @Column({type:'int',default:0})
  browse_count : number;
}
