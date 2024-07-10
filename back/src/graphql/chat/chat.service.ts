import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from './model/Chat';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  private redis: Redis;

  constructor(private readonly userService: UserService) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  /**
   * Creates a new chat.
   * @param senderUsername - The username of the sender.
   * @param receiverUsername - The username of the receiver.
   * @returns The created chat.
   * @throws NotFoundException - If the sender or receiver is not found.
   * @throws ConflictException - If the chat already exists.
   */
  async createChat(senderUsername: string, receiverUsername: string) : Promise<Chat> {
    const sender = await this.userService.getUserByEmail(senderUsername);
    const receiver = await this.userService.getUserByEmail(receiverUsername);

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    const chat = await this.getChatByEmails([sender.email, receiver.email]);

    if (chat) {
      throw new ConflictException('Chat already exists');
    }

    const chatId = uuidv4();
    const newChat: Chat = {
      id: chatId,
      users: [sender.email, receiver.email],
      createdAt: new Date(),
    };

    await this.redis.set(`chats:${chatId}`, JSON.stringify(newChat));

    return newChat;
  }

  /**
   * Retrieves all chats.
   * @returns A list of chats.
   */
  async getChats() {
    const chats = await this.redis.keys('chats:*');
    const chatData = await Promise.all(chats.map((key) => this.redis.get(key)));
    return chatData.map((chat) => {
      const parsedChat = JSON.parse(chat!) as Chat;
      parsedChat.createdAt = new Date(parsedChat.createdAt);
      return parsedChat;
    });
  }

  /**
   * Retrieves a chat by ID.
   * @param chatId - The ID of the chat.
   * @returns The chat.
   */
  async getChatById(chatId: string) {
    const chat = await this.redis.get(`chats:${chatId}`);
    return JSON.parse(chat!);
  }

  /**
   * Retrieves chats by username.
   * @param email - The email of the user.
   * @returns A list of chats.
   */
  async getChatsByEmail(email: string) {
    const chats = await this.getChats();
    return chats.filter((chat) => chat.users.includes(email));
  }

  /**
   * Retrieves a chat by usernames.
   * @param emails - The emails of the users.
   * @returns The chat or undefined.
   */
  async getChatByEmails(emails: string[]): Promise<Chat | undefined> {
    const chats = await this.getChats();
    return chats.find((chat) => chat.users.includes(emails[0]) && chat.users.includes(emails[1]));
  }
}
