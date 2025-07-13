import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { MediaSimple } from './dto/media-simple.dto';
import { generateResizedImages } from 'src/common/storage';

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

  async createMediasAndGetFirstThumb(
  files: Express.Multer.File[],
  ownerType: 'Post' | 'Comment' | 'Draft',
  ownerId: number,
  baseFolder: string
): Promise<string | null> {
  if (!files?.length) return null;

  let firstThumbUrl: string | null = null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const resizedImages = await generateResizedImages(file, baseFolder);

    await this.mediaRepo.save({
      owner_type: ownerType,
      owner_id: ownerId,
      url: resizedImages.original,
    });

    if (i === 0) {
      firstThumbUrl = resizedImages.thumb;
    }
  }

  return firstThumbUrl;
}

}
