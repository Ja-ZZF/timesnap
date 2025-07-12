import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { FollowService } from './follow.service';
import { Follow } from './entities/follow.entity';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

}
