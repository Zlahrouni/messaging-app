import { Injectable, Inject } from '@nestjs/common';
import { Redis } from '@nestjs/redis';

@Injectable()
export class CacheService {
  constructor(@Inject('RedisClient') private readonly redis: Redis) {}

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
