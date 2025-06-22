import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CollectService } from './collect.service';
import { Collect } from './entities/collect.entity';

@Controller('collects')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  create(@Body() collect: Partial<Collect>) {
    return this.collectService.create(collect);
  }

  @Get()
  findAll(): Promise<Collect[]> {
    return this.collectService.findAll();
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id') user_id: number) {
    return this.collectService.findByUser(user_id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.collectService.remove(id);
  }
}
