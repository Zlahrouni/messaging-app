import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { GetMessage, MessageInput } from './dto/message.dto';
import { verifyOAuthToken } from '../module/auth';
import { Message } from './model/Message';
import { User } from '../user/model/User';
import { NotFoundException } from '@nestjs/common';

jest.mock('../module/auth');

const mockMessageService = {
  createMessage: jest.fn(),
  getMessages: jest.fn(),
};

const mockUserService = {
  getUserByEmail: jest.fn(),
};

describe('MessageResolver', () => {
  let resolver: MessageResolver;
  let messageService: jest.Mocked<MessageService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageResolver,
        { provide: MessageService, useValue: mockMessageService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<MessageResolver>(MessageResolver);
    messageService = module.get(MessageService);
    userService = module.get(UserService);
  });

  describe('createMessage', () => {
    const messageInput: MessageInput = {
      token: 'invalidToken',
      receiveirEmail: 'receiver@example.com',
      content: 'Hello!',
    };

    it('should return 401 if token is invalid', async () => {
      (verifyOAuthToken as jest.Mock).mockResolvedValue(null);

      const response = await resolver.createMessage(messageInput);

      expect(verifyOAuthToken).toHaveBeenCalledWith(messageInput.token);
      expect(response).toEqual({
        code: 401,
        message: 'Unauthorized',
        messageCreated: null,
      });
    });

    it('should create a new message when the user has a valid token', async () => {
      const senderEmail = 'sender@example.com';
      const senderUser: User = {
        email: senderEmail,
        createdAt: new Date(),
      };
      const receiverUser: User = {
        email: messageInput.receiveirEmail,
        createdAt: new Date(),
      };

      (verifyOAuthToken as jest.Mock).mockResolvedValue(senderEmail);
      userService.getUserByEmail.mockResolvedValueOnce(senderUser);
      userService.getUserByEmail.mockResolvedValueOnce(receiverUser);
      messageService.createMessage.mockResolvedValue({
        id: 'messageId',
        content: 'Hello!',
        senderEmail,
        receiverEmail: messageInput.receiveirEmail,
        createdAt: new Date(),
        chatId: 'chatId',
      } as Message);

      const response = await resolver.createMessage(messageInput);

      expect(verifyOAuthToken).toHaveBeenCalledWith(messageInput.token);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(senderEmail);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        messageInput.receiveirEmail,
      );
      expect(messageService.createMessage).toHaveBeenCalledWith(
        senderUser.email,
        receiverUser.email,
        messageInput.content,
      );
      expect(response).toEqual({
        code: 200,
        message: 'Chat created successfully',
        messageCreated: {
          id: 'messageId',
          content: 'Hello!',
          senderEmail,
          receiverEmail: messageInput.receiveirEmail,
          createdAt: expect.any(Date),
          chatId: 'chatId',
        },
      });
    });

    it('should return 404 if sender is not found', async () => {
      const senderEmail = 'sender@example.com';
      const receiverUser: User = {
        email: messageInput.receiveirEmail,
        createdAt: new Date(),
      };

      (verifyOAuthToken as jest.Mock).mockResolvedValue(senderEmail);
      userService.getUserByEmail.mockResolvedValueOnce(null); // Sender not found
      userService.getUserByEmail.mockResolvedValueOnce(receiverUser);

      const response = await resolver.createMessage(messageInput);

      expect(verifyOAuthToken).toHaveBeenCalledWith(messageInput.token);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(senderEmail);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        messageInput.receiveirEmail,
      );
      expect(response).toEqual({
        code: 404,
        message: 'Sender not found',
        messageCreated: null,
      });
    });

    it('should return 404 if receiver is not found', async () => {
      const senderEmail = 'sender@example.com';
      const senderUser: User = {
        email: senderEmail,
        createdAt: new Date(),
      };

      (verifyOAuthToken as jest.Mock).mockResolvedValue(senderEmail);
      userService.getUserByEmail.mockResolvedValueOnce(senderUser);
      userService.getUserByEmail.mockResolvedValueOnce(null); // Receiver not found

      const response = await resolver.createMessage(messageInput);

      expect(verifyOAuthToken).toHaveBeenCalledWith(messageInput.token);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(senderEmail);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        messageInput.receiveirEmail,
      );
      expect(response).toEqual({
        code: 404,
        message: 'Receiver not found',
        messageCreated: null,
      });
    });
  });

  describe('getMessages', () => {
    const getMessage: GetMessage = {
      token: 'validToken',
      chatId: 'chatId',
    };

    it('should return 404 if the user is not authentified', async () => {
      const email = 'user@example.com';

      (verifyOAuthToken as jest.Mock).mockResolvedValue(email);
      userService.getUserByEmail.mockResolvedValue(null); // User not found

      const response = await resolver.getMessages(getMessage);

      expect(verifyOAuthToken).toHaveBeenCalledWith(getMessage.token);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(response).toEqual({
        code: 404,
        message: 'User not found',
        chats: [],
      });
    });

    it('should retrieve messages successfully if the user is authentified', async () => {
      const email = 'user@example.com';
      const user = { email, createdAt: new Date() };
      const messages: Message[] = [
        {
          id: 'messageId',
          chatId: 'chatId',
          content: 'Hello!',
          senderEmail: 'sender@example.com',
          receiverEmail: 'receiver@example.com',
          createdAt: new Date(),
        },
      ];

      (verifyOAuthToken as jest.Mock).mockResolvedValue(email);
      userService.getUserByEmail.mockResolvedValue(user);
      messageService.getMessages.mockResolvedValue(messages);

      const response = await resolver.getMessages(getMessage);

      expect(verifyOAuthToken).toHaveBeenCalledWith(getMessage.token);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(messageService.getMessages).toHaveBeenCalledWith(
        getMessage.chatId,
        user.email,
      );
      expect(response).toEqual({
        code: 200,
        message: 'Messages retrieved successfully',
        messages: messages,
      });
    });

    it('should handle NotFoundException thrown by messageService (messages not found) with a 404 code', async () => {
      const email = 'user@example.com';
      const user = { email, createdAt: new Date() };

      (verifyOAuthToken as jest.Mock).mockResolvedValue(email);
      userService.getUserByEmail.mockResolvedValue(user);
      messageService.getMessages.mockRejectedValue(
        new NotFoundException('Messages not found'),
      );

      const response = await resolver.getMessages(getMessage);

      expect(verifyOAuthToken).toHaveBeenCalledWith(getMessage.token);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(messageService.getMessages).toHaveBeenCalledWith(
        getMessage.chatId,
        user.email,
      );
      expect(response).toEqual({
        code: 404,
        message: 'Messages not found',
        messages: [],
      });
    });

    it('should handle a NotFoundExeption if a user is not part of this chat with a 404 code', async () => {
      (verifyOAuthToken as jest.Mock).mockResolvedValue(null);

      const response = await resolver.getMessages(getMessage);

      expect(verifyOAuthToken).toHaveBeenCalledWith(getMessage.token);
      expect(response).toEqual({
        code: 404,
        message: 'User not found',
        chats: [],
      });
    });
  });
});
