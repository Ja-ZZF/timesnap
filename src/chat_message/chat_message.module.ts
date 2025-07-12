import { Module } from '@nestjs/common';
import { ChatMessageService } from './chat_message.service';
import { ChatMessageController } from './chat_message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat_message.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Contact, User]),UserModule],
  providers: [ChatMessageService],
  controllers: [ChatMessageController]
})
export class ChatMessageModule {}
