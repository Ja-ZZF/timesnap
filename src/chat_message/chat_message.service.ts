// chat-message.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat_message.entity';
import { Repository } from 'typeorm';
import { Contact } from 'src/contact/entities/contact.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatItem } from './interface/chat-item.interface';
import { format } from 'date-fns'; // 推荐用 date-fns 或 dayjs 格式化时间

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,

    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // 1. 获取所有消息（可用于管理后台）
  async getAllMessages(): Promise<ChatMessage[]> {
    return this.messageRepo.find({
      relations: ['sender', 'contact'],
      order: { sent_at: 'ASC' },
    });
  }

  // 2. 获取指定用户发送的所有消息
  async getMessagesBySender(userId: number): Promise<ChatMessage[]> {
    return this.messageRepo.find({
      where: { sender: { user_id: userId } },
      relations: ['sender', 'contact'],
      order: { sent_at: 'ASC' },
    });
  }

  // 3. 获取某个 contact 对话下的所有消息
  async getMessagesByContact(contactId: number): Promise<ChatMessage[]> {
    return this.messageRepo.find({
      where: { contact: { contact_id: contactId } },
      relations: ['sender'],
      order: { sent_at: 'ASC' },
    });
  }

  // 4. 新增一条消息，并更新 contact 的 last_message_id
  async createMessage(dto: CreateChatMessageDto): Promise<ChatMessage> {
    const { contact_id, sender_id, content, message_type = 'text' } = dto;

    const contact = await this.contactRepo.findOneByOrFail({ contact_id });
    const sender = await this.userRepo.findOneByOrFail({ user_id: sender_id });

    const message = this.messageRepo.create({
      contact,
      sender,
      content,
      message_type,
    });

    const saved = await this.messageRepo.save(message);

    return saved;
  }

  async getChatItemsByContact(contactId: number): Promise<ChatItem[]> {
    const messages = await this.messageRepo.find({
      where: { contact: { contact_id: contactId } },
      relations: ['sender'],
      order: { sent_at: 'ASC' },
    });

    return messages.map((msg) => ({
      time: format(msg.sent_at, 'yyyy-MM-dd HH:mm:ss'),
      content: msg.content,
      isImage: msg.message_type === 'image',
      user: {
        user_id: msg.sender.user_id.toString(),
        avatar: msg.sender.avatar,
        name: msg.sender.nickname,
      },
    }));
  }
}
