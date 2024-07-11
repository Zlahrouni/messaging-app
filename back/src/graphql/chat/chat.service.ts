import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from './model/Chat';
import { UserService } from '../user/user.service';
import { MessageService } from '../message/message.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  private redis: Redis;

  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {
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
  async createChat(senderEmail: string, receiverEmail: string): Promise<Chat> {
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

    await this.chatRepository.save(newChat);
    await this.redis.set(`chats:${chatId}`, JSON.stringify(newChat));

    return newChat;
  }

  /**
   * Retrieves all chats.
   * @returns A list of chats.
   */
  async getChats() {
    const chats = await this.redis.keys('chats:*');

    if (chats.length > 0) {
      const chatData = await Promise.all(
        chats.map((key) => this.redis.get(key)),
      );
      const myChats: Chat[] = chatData.map((chat) => {
        const parsedChat = JSON.parse(chat!) as Chat;
        parsedChat.createdAt = new Date(parsedChat.createdAt);
        return parsedChat;
      });

      if (myChats.length === 0) {
        throw new NotFoundException('No chats found');
      }

      return chats;
    } else {
      const chatsDB = await this.chatRepository.find();
      console.log('savedChats', chatsDB);
      return chatsDB;
    }
  }

  /**
   * Retrieves a chat by ID.
   * @param chatId - The ID of the chat.
   * @returns The chat.
   */
  async getChatById(chatId: string) {
    const chat = await this.redis.get(`chats:${chatId}`);

    if (ChatService.length > 0) {
      return JSON.parse(chat!);
    } else {
      const chatInDB = await this.chatRepository.findOne({
        where: { id: chatId },
      });
      return chatInDB;
    }
  }

  /**
   * Retrieves chats by username.
   * @param email - The email of the user.
   * @returns A list of chats.
   */
  async getChatsByEmail(email: string): Promise<Chat[]> {
    const chats = (await this.getChats()) as Chat[];
    return chats.filter((chat) => chat.users.includes(email));
  }

  /**
   * Retrieves a chat by usernames.
   * @param emails - The emails of the users.
   * @returns The chat or undefined.
   */
  async getChatByEmails(emails: string[]): Promise<Chat | undefined> {
    const chats = (await this.getChats()) as Chat[];
    return chats.find(
      (chat) =>
        chat.users.includes(emails[0]) && chat.users.includes(emails[1]),
    );
  }

  async getLastMessageOfChats(chats: Chat[]): Promise<
    Promise<{
      createdAt: Date;
      lastMessage: string;
      id: string;
      users: string[];
    }>[]
  > {
    return chats.map(async (chat) => {
      const messages = await this.messageService.getMessages(chat.id);
      const lastMessage = messages[messages.length - 1];
      return {
        id: chat.id,
        users: chat.users,
        lastMessage: lastMessage.content,
        createdAt: chat.createdAt,
      };
    });
  }
}
