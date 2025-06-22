// src/tag/tag.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  create(name: string) {
    const tag = this.tagRepo.create({ name });
    return this.tagRepo.save(tag);
  }

  findAll(): Promise<Tag[]> {
    return this.tagRepo.find();
  }

  findOne(id: number): Promise<Tag | null> {
    return this.tagRepo.findOneBy({ tag_id: id });
  }

  remove(id: number) {
    return this.tagRepo.delete(id);
  }
}
