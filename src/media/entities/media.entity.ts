import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  media_id: number;

  @Column({ type: 'enum', enum: ['Post', 'Comment', 'Draft'] })
  owner_type: 'Post' | 'Comment' | 'Draft';

  @Column()
  owner_id: number;

  @Column({ length: 255 })
  url: string;
}
