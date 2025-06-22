// src/browse/browse.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Browse } from './entities/browse.entity';

@Injectable()
export class BrowseService {
  constructor(
    @InjectRepository(Browse)
    private readonly browseRepo: Repository<Browse>,
  ) {}

  create(browse: Partial<Browse>) {
    return this.browseRepo.save(browse);
  }

  findAll(): Promise<Browse[]> {
    return this.browseRepo.find();
  }

  findByUser(userId: number): Promise<Browse[]> {
    return this.browseRepo.find({ where: { user_id: userId } });
  }

  findByPost(postId: number): Promise<Browse[]> {
    return this.browseRepo.find({ where: { post_id: postId } });
  }

  async remove(id: number) {
    return this.browseRepo.delete(id);
  }
}
