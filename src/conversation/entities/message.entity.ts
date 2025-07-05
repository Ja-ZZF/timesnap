import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn()
  message_id: number;

  @Column()
  conversation_id: number;

  @Column()
  user_id: number; // 发送者

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  is_image: boolean;

  @CreateDateColumn({ type: 'datetime' })
  send_time: Date;
} 