// src/conversation/conversation.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { promises } from 'dns';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation)
        private readonly ConversationRepo:Repository<Conversation>,
        @InjectRepository(Message)
        private readonly MessageRepo:Repository<Message>,
        @InjectRepository(User)
        private readonly UserRepo:Repository<User>,
    ){}

    async create(conversation:Partial<Conversation>){
        return this.ConversationRepo.save(conversation);
    }

    async findAll():Promise<Conversation[]>{
        return this.ConversationRepo.find();
    }

    findOne(id : number):Promise<Conversation | null>{
        return this.ConversationRepo.findOne({
            where:{conversation_id : id},
        });
    }

    // 获取用户所有会话的最新消息预览
    async getMessagePreviews(userId: number): Promise<{ avatar: string; name: string; message: string; conversationId: string }[]> {
      try {
        const conversations = await this.ConversationRepo.find();
        const previews: { avatar: string; name: string; message: string; conversationId: string }[] = [];
        for (const conv of conversations) {
          const latestMsg = await this.MessageRepo.findOne({
            where: { conversation_id: conv.conversation_id },
            order: { send_time: 'DESC' },
          });
          if (!latestMsg) continue;
          const user = await this.UserRepo.findOne({ where: { user_id: latestMsg.user_id } });
          if (!user) continue;
          previews.push({
            avatar: user.avatar,
            name: user.nickname,
            message: latestMsg.content,
            conversationId: String(conv.conversation_id),
          });
        }
        return previews;
      } catch (err) {
        console.error('getMessagePreviews error:', err);
        throw err;
      }
    }

    async getMessagesByConversationId(conversationId: number): Promise<{
      time: string;
      content: string;
      isImage?: boolean;
      user: {
        user_id: string;
        avatar: string;
        name: string;
      };
    }[]> {
      const messages = await this.MessageRepo.find({
        where: { conversation_id: conversationId },
        order: { send_time: 'ASC' },
      });

      const result: {
        time: string;
        content: string;
        isImage?: boolean;
        user: {
          user_id: string;
          avatar: string;
          name: string;
        };
      }[] = [];

      for (const msg of messages) {
        const user = await this.UserRepo.findOne({ where: { user_id: msg.user_id } });
        if (!user) continue;
        result.push({
          time: msg.send_time.toISOString(),
          content: msg.content,
          isImage: (msg as any).is_image ?? false,
          user: {
            user_id: String(user.user_id),
            avatar: user.avatar,
            name: user.nickname,
          },
        });
      }
      return result;
    }

    async sendMessage({
      conversationId,
      userId,
      content,
      isImage,
    }: {
      conversationId: number;
      userId: number;
      content: string;
      isImage?: boolean;
    }) {
      const message = this.MessageRepo.create({
        conversation_id: conversationId,
        user_id: userId,
        content,
        is_image: isImage ?? false,
      });
      await this.MessageRepo.save(message);
      // 返回格式与 getMessagesByConversationId 一致
      const user = await this.UserRepo.findOne({ where: { user_id: userId } });
      return {
        time: message.send_time?.toISOString() ?? new Date().toISOString(),
        content: message.content,
        isImage: message.is_image,
        user: {
          user_id: String(user?.user_id ?? userId),
          avatar: user?.avatar ?? '',
          name: user?.nickname ?? '',
        },
      };
    }
}
