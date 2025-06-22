// src/browse/browse.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrowseService } from './browse.service';
import { BrowseController } from './browse.controller';
import { Browse } from './entities/browse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Browse])],
  controllers: [BrowseController],
  providers: [BrowseService],
})
export class BrowseModule {}
