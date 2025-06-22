// src/tag/entities/tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'tag' })
export class Tag {
  @PrimaryGeneratedColumn()
  tag_id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @CreateDateColumn({ type: 'datetime' })
  create_time: Date;
}
