import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Post()
  async setCache(@Body('key') key: string, @Body('value') value: string): Promise<void> {
    await this.cacheService.set(key, value);
  }

  @Get(':key')
  async getCache(@Param('key') key: string): Promise<string | null> {
    return await this.cacheService.get(key);
  }

  @Delete(':key')
  async deleteCache(@Param('key') key: string): Promise<void> {
    await this.cacheService.del(key);
  }
}
