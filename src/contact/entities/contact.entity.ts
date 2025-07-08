// contact.entity.ts
import { ChatMessage } from 'src/chat_message/entities/chat_message.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity()
export class Contact {
  @PrimaryGeneratedColumn('increment')
  contact_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_1' })
  user1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_2' })
  user2: User;

  @ManyToOne(() => ChatMessage, { nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage?: ChatMessage;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
