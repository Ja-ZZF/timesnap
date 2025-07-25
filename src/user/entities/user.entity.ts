import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 100 })
  location: string;

  @Column({ type: 'enum', enum: ['Male', 'Female', 'Other'] })
  gender: 'Male' | 'Female' | 'Other';

  @Column({ length: 255 })
  avatar: string;

  @CreateDateColumn({ type: 'datetime' })
  create_time: Date;

  @Column({ type: 'int', default: 0 })
  followed_count: number;

  @Column({ type: 'int', default: 0 })
  follower_count: number;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, default: '我是一个人' })
  introduction: string;
}
