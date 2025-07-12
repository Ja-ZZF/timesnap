// contact.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { User } from 'src/user/entities/user.entity';
import { ContactSimple } from './dto/contact-simple.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    private readonly userService: UserService,
  ) {}

  async createContact(dto: CreateContactDto): Promise<Contact> {
    let { user_id_1, user_id_2 } = dto;

    if (user_id_1 === user_id_2) {
      throw new BadRequestException('不能添加自己为好友');
    }

    // 始终保持 user_id_1 < user_id_2 避免重复
    if (user_id_1 > user_id_2) {
      [user_id_1, user_id_2] = [user_id_2, user_id_1];
    }

    const existing = await this.contactRepo.findOne({
      where: {
        user1: { user_id: user_id_1 },
        user2: { user_id: user_id_2 },
      },
    });

    if (existing) {
      throw new BadRequestException('这两个用户已经是好友');
    }

    const user1 = new User();
    user1.user_id = user_id_1;

    const user2 = new User();
    user2.user_id = user_id_2;

    const contact = this.contactRepo.create({
      user1,
      user2,
    });

    return this.contactRepo.save(contact);
  }

  async getSimple(self_id: number): Promise<ContactSimple[]> {
    const contacts = await this.contactRepo.find({
      where: [{ user1: { user_id: self_id } }, { user2: { user_id: self_id } }],
      relations: ['user1', 'user2', 'lastMessage'],
      order: { updated_at: 'DESC' },
    });

    const results: ContactSimple[] = [];

    for (const contact of contacts) {
      const isUser1 = contact.user1.user_id === self_id;
      const friend = isUser1 ? contact.user2 : contact.user1;

      const friendSimple = await this.userService.getSimple(
        self_id,
        friend.user_id,
      );

      results.push({
        contact_id: contact.contact_id,
        friend: friendSimple,
        latest_message: contact.lastMessage?.content || '',
      });
    }
    return results;
  }
}
