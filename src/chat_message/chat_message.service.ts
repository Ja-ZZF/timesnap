// chat-message.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat_message.entity';
import { Repository } from 'typeorm';
import { ChatSimple } from './dto/chat-simple.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,

    private readonly userService :UserService,
  ) {}


  async getSimple(self_id:number,contact_id : number): Promise<ChatSimple[]>{
    const chat_messages = await this.messageRepo.find({
      where:{contact_id : contact_id},
    });

    if(chat_messages.length === 0){
      throw new NotFoundException('对话未找到');
    }

    const chatSimples : ChatSimple[] = [];

    for (const chat_message of chat_messages){
      const sender = await this.userService.getSimple(self_id,chat_message.sender_id);
      const isImage = chat_message.message_type === 'image';

      chatSimples.push({
        chat_id : chat_message.chat_message_id,
        contact_id : contact_id,
        sender : sender,
        send_time : chat_message.sent_at,
        content : chat_message.content || ' ',
        isImage :isImage,
      });
    };

    return chatSimples;
  }
}
