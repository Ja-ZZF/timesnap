import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatMessage } from './entities/chat_message.entity';
import { ChatMessageService } from './chat_message.service';
import { ChatItem } from './interface/chat-item.interface';
import { CreateSimpleChatMessageDto } from './dto/create-simple-chat-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('chat-messages')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}


  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getChatSimple(@CurrentUser('user_id') self_id : number , @Query('contact_id') contact_id : number){
    return this.chatMessageService.getSimple(self_id,contact_id);
  }
}
