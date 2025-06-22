// src/post-tag/entities/post-tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Tag } from '../../tag/entities/tag.entity';

@Entity({ name: 'post_tag' })
export class PostTag {
  @PrimaryGeneratedColumn()
  post_tag_id: number;

  @Column()
  post_id: number;

  @Column()
  tag_id: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
