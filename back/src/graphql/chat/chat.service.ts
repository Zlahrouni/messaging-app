import {
  ConflictException, forwardRef, Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from './model/Chat';
import { UserService } from '../user/user.service';
import {ChatDto} from "./chat.response";
import {MessageService} from "../message/message.service";

@Injectable()
export class ChatService {
  private redis: Redis;

  constructor(
      private readonly userService: UserService, @Inject(forwardRef(() => MessageService))
      private noteService: MessageService,) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  /**
   * Creates a new chat.
   * @returns The created chat.
   * @param senderEmail - The email of the sender.
   * @param receiverEmail - The email of the receiver.
   * @throws NotFoundException - If the sender or receiver is not found.
   * @throws ConflictException - If the chat already exists.
   */
  async createChat(senderEmail: string, receiverEmail: string) : Promise<Chat> {
    const sender = await this.userService.getUserByEmail(senderEmail);
    const receiver = await this.userService.getUserByEmail(receiverEmail);

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
  async getChatsByEmail(email: string): Promise<ChatDto[]> {
    const chats = await this.getChats();
    const myChat = chats.filter((chat) => chat.users.includes(email));
    return myChat.map(chat => {
      return {
        id: chat.id,
        users: chat.users,
        lastMessage: "Hello",
        createdAt: chat.createdAt
      }
    });
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
