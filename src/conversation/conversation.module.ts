// src/conversation/conversation.module.ts

import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from './entities/conversation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Conversation])],
  providers: [ConversationService],
  controllers: [ConversationController]
})
export class ConversationModule {}
