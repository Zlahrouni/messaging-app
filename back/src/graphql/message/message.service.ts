import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { MessageInput } from './dto/message.dto';

@Injectable()
export class MessageService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createMessage(messageDto: MessageInput) {
    const messageId = Math.random().toString(36).substring(7);
    this.redis.set(`messages: ${messageId}`, JSON.stringify(messageDto));
    return messageDto;
  }

  async getMessages() {
    const messages = await this.redis.keys('messages:*');
    const messageData = await Promise.all(
      messages.map((key) => this.redis.get(key)),
    );
    return messageData.map((message) => JSON.parse(message!));
  }
}
