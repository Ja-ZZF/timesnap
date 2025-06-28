// redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';

@Module({
  providers: [RedisProvider],
  exports: [RedisProvider],
})
export class RedisModule {}
