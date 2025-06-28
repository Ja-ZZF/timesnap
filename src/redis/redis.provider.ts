// redis/redis.provider.ts
import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis({
      host: '47.117.0.254',
      port: 6379,
      // password: 'your_password', // 可选
      db: 0, // 可设置多 Redis 逻辑库
    });
  },
};
