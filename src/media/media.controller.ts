import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';

@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll(): Promise<Media[]> {
    return this.mediaService.findAll();
  }

  @Get(':type/:id')
  findByOwner(@Param('type') type: 'Post' | 'Comment' | 'Draft', @Param('id') id: number) {
    return this.mediaService.findByOwner(type, id);
  }

  @Get(':type/:id/urls')
  async getUrlsByOwner(
    @Param('type') type:'Post' | 'Comment'| 'Draft',
    @Param('id') id:number,
  ):Promise<string[]>{
    return this.mediaService.findUrlsByOwner(type,id);
  }


  @Post()
  create(@Body() media: Partial<Media>) {
    return this.mediaService.create(media);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.mediaService.remove(id);
  }

  
}
