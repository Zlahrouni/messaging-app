import { Injectable, NotFoundException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { MessageInput } from './dto/message.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ChatService } from '../chat/chat.service';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './model/Message';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../chat/model/Chat';

@Injectable()
export class MessageService {
  private redis: Redis;

  constructor(
    @InjectQueue('messageSend') private messageSend: Queue,
    private chatService: ChatService,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createMessage(data: MessageInput) {
    let chatId = data.chatId;
    if (data.chatId) {
      const chat: Chat = await this.chatService.getChatById(data.chatId);
      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      chatId = chat.id;
    } else {
      const newChat = await this.chatService.createChat(
        data.senderId,
        data.receiverId,
      );
      chatId = newChat.id;
    }

    const newMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      content: data.content,
      senderId: data.senderId,
      receiverId: data.receiverId,
      createdAt: new Date(),
    };

    await this.messageSend.add('send', newMessage);
    const job = await this.messageSend.add('newMessage', newMessage);
    console.log(`Message added to queue: ${job.id}`);

    await this.messageRepository.save(newMessage);
    await this.redis.set(`messages:${newMessage}`, JSON.stringify(data));
    return newMessage;
  }

  async processNewMessage(data: MessageInput) {
    const { content, senderId, chatId } = data;
    console.log(
      `New message sent : ${content}, from: ${senderId} in ${chatId}`,
    );
  }

  async getMessages(chatId: string) {
    const messagesKeys = await this.redis.keys(`messages: ${chatId}:*`);

    if (messagesKeys.length > 0) {
      const messageData = await Promise.all(
        messagesKeys.map((key) => this.redis.get(key)),
      );
      return messageData.map((message) => {
        const parsedMessage = JSON.parse(message!);
        parsedMessage.createdAt = new Date(parsedMessage.createdAt);
        return parsedMessage;
      });
    } else {
      const messageDB = await this.messageRepository.find({
        where: { chatId },
      });
      return messageDB;
    }
  }

  async getMyLastMessages(email: string) {
    const messages = await this.getMessages('gggg');
    const myMessage = messages.filter(
      (message) => message.senderId === email && message.receiverId === email,
    );
  }
}
