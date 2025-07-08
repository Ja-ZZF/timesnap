import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatMessage } from './entities/chat_message.entity';
import { ChatMessageService } from './chat_message.service';
import { ChatItem } from './interface/chat-item.interface';

@Controller('chat-message')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  // 1. 获取所有消息（管理用途）
  @Get('all')
  async getAllMessages(): Promise<ChatMessage[]> {
    return this.chatMessageService.getAllMessages();
  }

  // 2. 获取指定用户发送的所有消息
  @Get('sender')
  async getMessagesBySender(
    @Query('userId') userId: string,
  ): Promise<ChatMessage[]> {
    if (!userId) {
      throw new BadRequestException('缺少 userId 参数');
    }
    return this.chatMessageService.getMessagesBySender(Number(userId));
  }

  // 3. 获取某个会话（contact）下的所有消息
  @Get('contact')
  async getMessagesByContact(
    @Query('contactId') contactId: string,
  ): Promise<ChatMessage[]> {
    if (!contactId) {
      throw new BadRequestException('缺少 contactId 参数');
    }
    return this.chatMessageService.getMessagesByContact(Number(contactId));
  }

  // 4. 新增一条消息
  @Post('create')
  async createMessage(@Body() dto: CreateChatMessageDto): Promise<ChatMessage> {
    return this.chatMessageService.createMessage(dto);
  }

  //5. 根据contactId获取信息
  @Get('chat-items')
  async getChatItems(
    @Query('contactId') contactId: string,
  ): Promise<ChatItem[]> {
    if (!contactId) {
      throw new BadRequestException('缺少 contactId 参数');
    }
    return this.chatMessageService.getChatItemsByContact(Number(contactId));
  }
}
