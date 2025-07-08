// contact.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // 1. 获取所有联系人
  @Get('all')
  async getAllContacts(): Promise<Contact[]> {
    return this.contactService.findAll();
  }

  // 2. 获取指定用户的联系人
  @Get()
  async getContacts(@Query('userId') userId: string): Promise<Contact[]> {
    if (!userId) {
      throw new Error('Missing userId query parameter');
    }

    return this.contactService.findAllByUserId(Number(userId));
  }

  //3. 新增一对联系
  @Post()
  async createContact(@Body() dto: CreateContactDto) {
    return this.contactService.createContact(dto);
  }

  //4. 获取指定用户的聊天信息
  @Get('preview')
  async getMessagePreviews(
    @Query('userId') userId: string,
  ): Promise<PreviewItem[]> {
    if (!userId) {
      throw new Error('Missing userId');
    }

    return this.contactService.getMessagePreviews(Number(userId));
  }
}
