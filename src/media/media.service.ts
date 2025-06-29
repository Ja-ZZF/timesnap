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

  async findByOwnerBatch(ownerType: 'Post' | 'Comment', ownerIds: number[]): Promise<Map<number, any[]>> {
    if (!ownerIds || ownerIds.length === 0) return new Map();

    const medias = await this.mediaRepo.find({
      where: {
        owner_type: ownerType,
        owner_id: In(ownerIds),
      }
    });

    const map = new Map<number, any[]>();
    for (const media of medias) {
      if (!map.has(media.owner_id)) {
        map.set(media.owner_id, []);
      }
      map.get(media.owner_id)!.push(media);
    }

    return map;
  }


  async getPostCoverUrls(postIds: number[]): Promise<Map<number, string>> {
    if (!postIds || postIds.length === 0) {
      return new Map();
    }

    const mediaList = await this.mediaRepo.createQueryBuilder('m')
      .select(['m.owner_id', 'm.url'])
      .where('m.owner_type = :ownerType', { ownerType: 'Post' })
      .andWhere('m.owner_id IN (:...postIds)', { postIds })
      .orderBy('m.media_id', 'ASC')
      .getRawMany();

    const mediaMap = new Map<number, string>();
    for (const m of mediaList) {
      const ownerId = m.m_owner_id;  // getRawMany 返回的字段名可能是带前缀的
      if (!mediaMap.has(ownerId)) {
        mediaMap.set(ownerId, m.m_url);
      }
    }

    return mediaMap;
  }



  
}
