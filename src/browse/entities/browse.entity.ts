// src/browse/entities/browse.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'browse' })
export class Browse {
  @PrimaryGeneratedColumn()
  browse_id: number;

  @Column()
  user_id: number;

  @Column()
  post_id: number;

  @CreateDateColumn({ type: 'datetime' })
  view_time: Date;
}
