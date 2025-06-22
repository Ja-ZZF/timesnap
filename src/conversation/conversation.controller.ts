// src/conversation/conversation.controller.ts

import { Controller, Get, Post as HttpPost, Put, Delete, Param, Body, NotFoundException, ParseIntPipe, Post } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { promises } from 'dns';

@Controller('conversations')
export class ConversationController {
    constructor(private readonly conversationService:ConversationService){}

    @Get()
    findAll():Promise<Conversation[]>{
        return this.conversationService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id :string) : Promise<Conversation>{
        const conversation = await this.conversationService.findOne(+id);

        if(!conversation){
            throw new NotFoundException(`Conversation ${id} not found`);

        }
        return conversation;
    }

    @Post()
    create (@Body() conversation : Partial<Conversation>){
        return this.conversationService.create(conversation);
    }

}
