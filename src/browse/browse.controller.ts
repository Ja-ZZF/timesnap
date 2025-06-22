// src/browse/browse.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BrowseService } from './browse.service';
import { Browse } from './entities/browse.entity';

@Controller('browses')
export class BrowseController {
  constructor(private readonly browseService: BrowseService) {}

  @Post()
  create(@Body() browse: Partial<Browse>) {
    return this.browseService.create(browse);
  }

  @Get()
  findAll(): Promise<Browse[]> {
    return this.browseService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number): Promise<Browse[]> {
    return this.browseService.findByUser(userId);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: number): Promise<Browse[]> {
    return this.browseService.findByPost(postId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.browseService.remove(id);
  }
}
