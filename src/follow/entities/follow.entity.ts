import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  follow_id: number;

  @Column()
  follower_user_id: number; //关注者

  @Column()
  followed_user_id: number; //被关注者

  @CreateDateColumn({ type: 'datetime' })
  follow_time: Date;
}
