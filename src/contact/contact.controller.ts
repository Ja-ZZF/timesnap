// contact.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('simple')
  getContactSimple(@CurrentUser('user_id') self_id : number){
    return this.contactService.getSimple(self_id);
  }
}
