// src/browse/browse.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { BrowseService } from './browse.service';
import { Browse } from './entities/browse.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';

@Controller('browses')
export class BrowseController {
  constructor(private readonly browseService: BrowseService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  addBrowse(
    @CurrentUser('uesr_id') self_id : number,
    @Body('post_id') post_id : number 
  ){
    this.browseService.addBrowse(self_id,post_id);
  }
}
