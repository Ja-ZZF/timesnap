// src/like/entities/like.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'like' })
export class Like {
  @PrimaryGeneratedColumn()
  like_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'enum', enum: ['Post', 'Comment'] })
  target_type: 'Post' | 'Comment';

  @Column()
  target_id: number;

  @CreateDateColumn({ type: 'datetime' })
  like_time: Date;
}
