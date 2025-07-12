import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';

@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}


}
