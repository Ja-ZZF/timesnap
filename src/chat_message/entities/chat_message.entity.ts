// chat-message.entity.ts
import { Contact } from 'src/contact/entities/contact.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('increment')
  chat_message_id: number;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['text', 'image', 'video', 'audio'], default: 'text' })
  message_type: 'text' | 'image' | 'video' | 'audio';

  @CreateDateColumn()
  sent_at: Date;
}
