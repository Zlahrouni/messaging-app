import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class MessageService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createMessage () {
  }

  async getMessages() {
  }
}
