import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { MessageInput } from './dto/message.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ChatService } from '../chat/chat.service';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './model/Message';

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
    let chat = await this.chatService.getChatById(data.chatId);

    if (!chat) {
      chat = await this.chatService.createChat(data.senderId, data.receiverId);
    }

    const newMessage: Message = {
      id: uuidv4(),
      chatId: data.chatId,
      content: data.content,
      senderId: data.senderId,
      receiverId: data.receiverId,
      createdAt: new Date(),
    };

    await this.messageSend.add('send', newMessage);
    const job = await this.messageSend.add('newMessage', newMessage);
    console.log(`Message added to queue: ${job.id}`);

    await this.redis.set(`messages:${newMessage}`, JSON.stringify(data));
    return newMessage;
  }

  async processNewMessage(data: MessageInput) {
    const { content, senderId, chatId } = data;
    console.log(
      `New message sent : ${content}, from: ${senderId} in ${chatId}`,
    );
  }

  async getMessages() {
    const messages = await this.redis.keys('messages:*');
    const messageData = await Promise.all(
      messages.map((key) => this.redis.get(key)),
    );
    return messageData.map((message) => {
      const parsedMessage = JSON.parse(message!);
      parsedMessage.createdAt = new Date(parsedMessage.createdAt);
      return parsedMessage;
    });
  }

  async getMyLastMessages(email: string) {
    const messages = await this.getMessages();
    const myMessage=  messages.filter((message) => message.senderId === email && message.receiverId === email);
    

  }
}
