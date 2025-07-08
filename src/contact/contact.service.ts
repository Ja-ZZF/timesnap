// contact.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
  ) {}

  // 1. 获取所有联系人（联查 user1、user2、lastMessage）
  async findAll(): Promise<Contact[]> {
    return this.contactRepo.find({
      relations: ['user1', 'user2', 'lastMessage'],
      order: { updated_at: 'DESC' },
    });
  }

  // 2. 获取指定用户的所有联系人（联查）
  async findAllByUserId(userId: number): Promise<Contact[]> {
    return this.contactRepo.find({
      where: [{ user1: { user_id: userId } }, { user2: { user_id: userId } }],
      relations: ['user1', 'user2', 'lastMessage'],
      order: { updated_at: 'DESC' },
    });
  }

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

  async getMessagePreviews(userId: number): Promise<PreviewItem[]> {
    const contacts = await this.contactRepo.find({
      where: [{ user1: { user_id: userId } }, { user2: { user_id: userId } }],
      relations: ['user1', 'user2', 'lastMessage'],
      order: { updated_at: 'DESC' },
    });

    const result: PreviewItem[] = contacts.map((contact) => {
      // 判断会话中哪个是“对方”
      const isUser1 = contact.user1.user_id === userId;
      const otherUser = isUser1 ? contact.user1 : contact.user2;

      return {
        avatar: otherUser.avatar,
        name: otherUser.nickname,
        message: contact.lastMessage?.content || '',
        conversationId: contact.contact_id.toString(),
        friendId : otherUser.user_id.toString(),
      };
    });

    return result;
  }
}
