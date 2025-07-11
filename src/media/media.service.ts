import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { MediaSimple } from './dto/media-simple.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
  ) {}


  async getSimple(
    owner_type: 'Post' | 'Comment',
    owner_id: number,
  ): Promise<MediaSimple[]> {
    const medias = await this.mediaRepo.find({
      where: {
        owner_type: owner_type,
        owner_id: owner_id,
      },
    });

    const mediaSimple: MediaSimple[] = medias.map((media) => ({
      media_id: media.media_id,
      url: media.url,
    }));

    return mediaSimple;
  }

  async getSimpleBatchForComment(
    commentIds: number[],
  ): Promise<Map<number, MediaSimple[]>> {
    if (commentIds.length === 0) return new Map();

    const medias = await this.mediaRepo.find({
      where: {
        owner_type: 'Comment',
        owner_id: In(commentIds),
      },
    });

    const resultMap = new Map<number, MediaSimple[]>();

    for (const media of medias) {
      const list = resultMap.get(media.owner_id) ?? [];
      list.push({
        media_id: media.media_id,
        url: media.url,
      });
      resultMap.set(media.owner_id, list);
    }

    return resultMap;
  }
}
