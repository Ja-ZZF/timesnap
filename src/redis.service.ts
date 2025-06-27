// src/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: '47.117.0.254', // 或你的服务器IP
      port: 6379,
      // password: '你的密码', // 如果有设置密码的话
    });
  }

  async set(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async get(key: string): Promise<string|null> {
    return this.redis.get(key);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
