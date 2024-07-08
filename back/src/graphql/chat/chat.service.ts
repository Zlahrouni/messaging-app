import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import Redis from 'ioredis';
import {MessageInput} from '../message/dto/message.dto';
import {v4 as uuidv4} from 'uuid';
import {Chat} from "./model/Chat";
import {ChatInput} from "./dto/chat.dto";
import {getUser} from "../module/auth";
import {UserService} from "../user/user.service";

@Injectable()
export class ChatService {
  private redis: Redis;

  constructor(private readonly userService: UserService) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createChat(chatInput: ChatInput) {
    const user = getUser(chatInput.token);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userIds = await this.userService.getIds()

    if (!userIds.includes(chatInput.recipientId)) {
      throw new NotFoundException('Receiver not found');
    }

    const receiver = await this.userService.getUserById(chatInput.recipientId);

    const chat = await this.getChatByUsernames([user.username, receiver.username]);

    if (chat) {
        throw new ConflictException('Chat already exists');
    }

    const chatId = uuidv4();
    const newChat: Chat = {
      id: chatId,
      users: [user.username, receiver.username],
      createdAt: new Date(),
      messages: [],
    };

    await this.redis.set(`chats:${chatId}`, JSON.stringify(newChat));

    return newChat;
  }

  async getChats() {
    const chats = await this.redis.keys('chats:*');
    const chatData = await Promise.all(chats.map((key) => this.redis.get(key)));
    return chatData.map((chat) => {
      const parsedChat = JSON.parse(chat!) as Chat;
      parsedChat.createdAt = new Date(parsedChat.createdAt);
      return parsedChat;
    });
  }

  async getChatById(chatId: string) {
    const chat = await this.redis.get(`chats:${chatId}`);
    return JSON.parse(chat!);
  }

  async getChatByUsername(username: string) {
    const chats = await this.getChats();
    return chats.filter((chat) => chat.users.includes(username));
  }

  async addMessageToChat(chatId: string, message: MessageInput) {
    const chat = await this.getChatById(chatId);
    if (chat) {
      chat.messages.push(message);
      console.log(`Chat: ${JSON.stringify(chat.messages)}`);
      await this.redis.set(`chats:${chatId}`, JSON.stringify(chat));
    } else {
      console.log(`Chat not found: ${chatId}`);
    }
  }

  async getChatByUsernames(usernames: string[]) {
    const chats = await this.getChats();
    return chats.find((chat) => chat.users.includes(usernames[0]) && chat.users.includes(usernames[1]));
  }
}
