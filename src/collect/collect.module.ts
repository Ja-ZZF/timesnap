import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectService } from './collect.service';
import { CollectController } from './collect.controller';
import { Collect } from './entities/collect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collect])],
  controllers: [CollectController],
  providers: [CollectService],
})
export class CollectModule {}
