import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { MessageInput } from '../message/dto/message.dto';

@Injectable()
export class ChatService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createChat(senderId: string, receiverId: string) {
    const sender = parseInt(senderId.toString(), 10);
    const receiver = parseInt(receiverId.toString(), 10);
    const chatId = `${Math.min(sender, receiver)}:${Math.max(sender, receiver)}`;
    const chatExists = await this.redis.exists(`chats:${chatId}`);
    console.log(`Chat exists: ${chatExists}`);
    if (!chatExists) {
      const newChat = await this.redis.set(
        `chats:${chatId}`,
        JSON.stringify({
          id: chatId,
          users: [senderId, receiverId],
          createdAt: new Date(),
          messages: [],
        }),
      );
      console.log(`Chat created: ${newChat}`);
    }
  }

  async getChats() {
    // get chats logic
  }

  async getChatById(chatId: string) {
    const chat = await this.redis.get(`chats:${chatId}`);
    return JSON.parse(chat!);
  }

  async addMessageToChat(chatId: string, message: MessageInput) {
    const chat = await this.getChatById(chatId);
    chat.messages.push(message);
    console.log(`Message added to chat: ${chatId}`);
    await this.redis.set(`chats:${chatId}`, JSON.stringify(chat));
  }
}
