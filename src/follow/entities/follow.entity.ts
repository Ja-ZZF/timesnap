import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  follow_id: number;

  @Column()
  follower_user_id: number;

  @Column()
  followed_user_id: number;

  @CreateDateColumn({ type: 'datetime' })
  follow_time: Date;
}
