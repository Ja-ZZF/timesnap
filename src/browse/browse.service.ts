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

  async addBrowse(self_id : number,post_id : number){
    const browse = this.browseRepo.create({
      user_id : self_id,
      post_id : post_id,
    });
    await this.browseRepo.save(browse);
  }
}
