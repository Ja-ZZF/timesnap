// src/post/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn({type:'bigint'})
  post_id: number;

  @Column({type : 'bigint'})
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  publish_time: Date;

  @Column({type:'varchar',length: 200 })
  title: string;

  @Column({type:'text'})
  content: string;

  @Column({type:'int',default:0})
  like_count : number;

  @Column({type:'int',default:0})
  collect_count : number;

  @Column({type:'int',default:0})
  browse_count : number;

  @Column({type:'int',default:0})
  comment_count : number;


  @Column({ type: 'enum', enum: ['Public', 'FansOnly', 'MutualOnly', 'Private'], default: 'Public' })
  view_permission: 'Public' | 'FansOnly' | 'MutualOnly' | 'Private';

  @Column({ type: 'enum', enum: ['Public', 'FansOnly', 'MutualOnly', 'Closed'], default: 'Public' })
  comment_permission: 'Public' | 'FansOnly' | 'MutualOnly' | 'Closed';

}
