import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
  ) {}

  findAll(): Promise<Media[]> {
    return this.mediaRepo.find();
  }


  create(media: Partial<Media>): Promise<Media> {
    return this.mediaRepo.save(media);
  }

  remove(id: number): Promise<void> {
    return this.mediaRepo.delete(id).then(() => {});
  }

  async findUrlsByOwner(owner_type:'Post'| 'Comment'|'Draft',owner_id:number):Promise<string[]>{
    const medias = await this.mediaRepo.find({
      where:{owner_type,owner_id},
    });
    return medias.map(m=>m.url);
  }

  async findByOwner(ownerType: 'Post' | 'Comment' | 'Draft', ownerId: number): Promise<{ media_id: number; url: string }[]> {
    return this.mediaRepo.find({
      select: ['media_id', 'url'],
      where: {
        owner_type: ownerType,
        owner_id: ownerId,
      },
    });
  }



  
}
