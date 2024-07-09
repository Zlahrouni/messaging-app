import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { MessageInput } from './dto/message.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class MessageService {
  private redis: Redis;

  constructor(
    @InjectQueue('messageSend') private messageSend: Queue,
    private chatService: ChatService,
  ) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createMessage(data: MessageInput) {
    const chatId = `${data.senderId}:${data.receiverId}`;
   // await this.chatService.createChat(data.senderId, data.receiverId);
   // await this.chatService.addMessageToChat(chatId, data);
    const messageId = Math.random().toString(36).substring(7);
    this.redis.set(`messages: ${messageId}`, JSON.stringify(data));
    const job = await this.messageSend.add('newMessage', data);
    console.log(`Job added: ${job.id}`);
    return {
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
    };
  }

  async processNewMessage(data: MessageInput) {
    const { content, senderId, receiverId } = data;
    console.log(
      `New message sent : ${content}, from: ${senderId} to ${receiverId}`,
    );
  }

  async getMessages() {
    const messages = await this.redis.keys('messages:*');
    const messageData = await Promise.all(
      messages.map((key) => this.redis.get(key)),
    );
    return messageData.map((message) => JSON.parse(message!));
  }
}
