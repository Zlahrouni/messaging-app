import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
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
import {verifyOAuthToken} from "../module/auth";

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

  async createMessage(senderEmail: string, receiveirEmail: string, content: string) {
    let chatId: string;

    if (senderEmail === receiveirEmail) {
        throw new ConflictException('Cannot send message to yourself');
    }

    const chat = await this.chatService.getChatByEmails([senderEmail, receiveirEmail]);

    if (chat) {
        chatId = chat.id;
    } else {
      const chatCreated = await this.chatService.createChat(senderEmail, receiveirEmail);
      chatId = chatCreated.id
    }
    const newMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      content: content,
      senderEmail: senderEmail,
      receiverEmail: receiveirEmail,
      createdAt: new Date(),
    };
    console.log('New message created', newMessage);
    await this.messageSend.add('send', newMessage);
    const job = await this.messageSend.add('newMessage', newMessage);
    console.log(`Message added to queue: ${job.id}`);

    await this.messageRepository.save(newMessage);
    await this.redis.set(`messages:${newMessage}`, JSON.stringify(newMessage));
    return newMessage;
  }

  async processNewMessage(data: MessageInput) {
    try {
      const { content, token, receiveirEmail } = data;
      const email  = await verifyOAuthToken(token);
      console.log(
          `New message sent : ${content}, from: ${email} to ${receiveirEmail}`,
      );
    } catch (error) {
      console.error('Error processing new message', error);
    }
  }

  async getMessages(chatId: string): Promise<Message[]> {
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

}
