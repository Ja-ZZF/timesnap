// src/conversation/conversation.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { promises } from 'dns';

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation)
        private readonly ConversationRepo:Repository<Conversation>,
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
}
