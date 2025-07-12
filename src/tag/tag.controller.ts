// src/tag/tag.controller.ts
import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

}
