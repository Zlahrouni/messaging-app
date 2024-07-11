import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './model/Message';
import { ChatService } from '../chat/chat.service';
import { Queue } from 'bull';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';

describe('MessageService', () => {
  let service: MessageService;
  let chatService: ChatService;
  let messageRepository: Repository<Message>;
  let messageSendQueue: Queue;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: ChatService,
          useValue: {
            getChatByEmails: jest.fn(),
            createChat: jest.fn(),
            getChatById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Message),
          useClass: Repository,
        },
        {
          provide: 'BullQueue_messageSend',
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    chatService = module.get<ChatService>(ChatService);
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    messageSendQueue = module.get<Queue>('BullQueue_messageSend');
    redisClient = new Redis();

    service['redis'] = redisClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should throw a ConflictException if sender and receiver emails are the same', async () => {
      await expect(
        service.createMessage('test@example.com', 'test@example.com', 'Hello'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new chat if none exists and save the message in Redis and the database', async () => {
      jest.spyOn(chatService, 'getChatByEmails').mockResolvedValue(undefined);
      jest
        .spyOn(chatService, 'createChat')
        .mockResolvedValue({ id: 'chatId', users: [] } as any);
      jest
        .spyOn(messageSendQueue, 'add')
        .mockResolvedValue({ id: 'jobId' } as any);
      jest.spyOn(messageRepository, 'save').mockResolvedValue({} as any);
      jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

      await service.createMessage(
        'sender@example.com',
        'receiver@example.com',
        'Hello',
      );

      expect(chatService.getChatByEmails).toHaveBeenCalledWith([
        'sender@example.com',
        'receiver@example.com',
      ]);
      expect(chatService.createChat).toHaveBeenCalledWith(
        'sender@example.com',
        'receiver@example.com',
      );
      // Once for 'send' and once for 'newMessage'
      expect(messageSendQueue.add).toHaveBeenCalledTimes(2);
      expect(messageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hello',
          senderEmail: 'sender@example.com',
          receiverEmail: 'receiver@example.com',
        }),
      );
      expect(redisClient.set).toHaveBeenCalledWith(
        expect.stringContaining('messages:'),
        expect.any(String),
      );
    });
  });

  describe('getMessages', () => {
    it('should return messages from Redis if they are available there', async () => {
      const chatId = 'chatId';
      const message = {
        id: 'messageId',
        chatId: chatId,
        content: 'Hello',
        senderEmail: 'sender@example.com',
        receiverEmail: 'receiver@example.com',
        createdAt: new Date().toISOString(),
      };

      (chatService.getChatById as jest.Mock).mockResolvedValue({
        id: chatId,
        users: ['sender@example.com', 'receiver@example.com'],
      });

      jest
        .spyOn(redisClient, 'keys')
        .mockResolvedValue([`messages:${chatId}:1`]);
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(message));

      const messages = await service.getMessages(chatId);

      expect(redisClient.keys).toHaveBeenCalledWith(`messages: ${chatId}:*`);
      expect(redisClient.get).toHaveBeenCalledWith(`messages:${chatId}:1`);
      expect(messages).toEqual([
        {
          ...message,
          createdAt: new Date(message.createdAt),
        },
      ]);
    });

    it('should return messages from the database if not available in Redis', async () => {
      const chatId = 'chatId';
      const message = {
        id: 'messageId',
        chatId: chatId,
        content: 'Hello',
        senderEmail: 'sender@example.com',
        receiverEmail: 'receiver@example.com',
        createdAt: new Date(),
      };
      const chat = {
        id: chatId,
        users: ['sender@example.com', 'receiver@example.com'],
      };

      jest.spyOn(chatService, 'getChatById').mockResolvedValue(chat);
      jest.spyOn(redisClient, 'keys').mockResolvedValue([]);
      jest.spyOn(messageRepository, 'find').mockResolvedValue([message]);

      const messages = await service.getMessages(chatId);

      expect(chatService.getChatById).toHaveBeenCalledWith(chatId);
      expect(redisClient.keys).toHaveBeenCalledWith(`messages: ${chatId}:*`);
      expect(messageRepository.find).toHaveBeenCalledWith({
        where: { chatId },
      });
      expect(messages).toEqual([message]);
    });
  });
});
