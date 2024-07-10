import { Test, TestingModule } from '@nestjs/testing';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { MessageInput } from './dto/message.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { verifyOAuthToken } from '../module/auth';

jest.mock('../module/auth', () => ({
  verifyOAuthToken: jest.fn(),
}));

describe('MessageResolver', () => {
  let resolver: MessageResolver;
  //eslint-disable-next-line
  let service: MessageService;

  const messageServiceMock = {
    createMessage: jest
      .fn()
      .mockImplementation((messageInput: MessageInput) => {
        return {
          ...messageInput,
          id: '123456',
        };
      }),
    getMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageResolver,
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compile();

    resolver = module.get<MessageResolver>(MessageResolver);
    service = module.get<MessageService>(MessageService);
  });

  describe('createMessage', () => {
    const messageInputMock: MessageInput = {
      senderId: 'senderId',
      receiverId: 'receiverId',
      chatId: 'chatId',
      content: 'Hello, world!',
      createdAt: new Date(),
      token: 'token',
    };

    it('should return an unauthorized response if the token is invalid', async () => {
      (verifyOAuthToken as jest.Mock).mockResolvedValue(null);

      const expectedMessage = {
        code: 401,
        message: 'Unauthorized',
        chat: null,
      };

      const result = await resolver.createMessage(messageInputMock);
      expect(result).toEqual(expectedMessage);
      expect(messageServiceMock.createMessage).not.toHaveBeenCalled();
    });

    it('should create a new message and return it if the token is valid', async () => {
      const userEmailMock = 'user@example.com';
      (verifyOAuthToken as jest.Mock).mockResolvedValue(userEmailMock);

      const expectedMessage = {
        code: 200,
        message: 'Chat created successfully',
        newMessage: {
          ...messageInputMock,
          id: '123456',
        },
      };

      const result = await resolver.createMessage(messageInputMock);
      expect(result).toEqual(expectedMessage);
      expect(messageServiceMock.createMessage).toHaveBeenCalledWith(
        messageInputMock,
      );
    });

    it('should handle NotFoundException and return the appropriate response', async () => {
      const notFoundException = new NotFoundException('Chat not found');

      messageServiceMock.createMessage.mockRejectedValue(notFoundException);

      const expectedResult = {
        code: 404,
        message: notFoundException.message,
        chat: null,
      };

      const result = await resolver.createMessage(messageInputMock);

      expect(result).toEqual(expectedResult);
      expect(messageServiceMock.createMessage).toHaveBeenCalledWith(
        messageInputMock,
      );
    });

    it('should handle ConflictException and return the appropriate response', async () => {
      const conflictException = new ConflictException('Chat already exists');

      messageServiceMock.createMessage.mockRejectedValue(conflictException);

      const expectedResult = {
        code: 409,
        message: conflictException.message,
        chat: null,
      };

      const result = await resolver.createMessage(messageInputMock);

      expect(result).toEqual(expectedResult);
      expect(messageServiceMock.createMessage).toHaveBeenCalledWith(
        messageInputMock,
      );
    });

    it('should handle other errors and return the appropriate response', async () => {
      const unknownError = new Error('Unknown error');

      messageServiceMock.createMessage.mockRejectedValue(unknownError);

      const expectedResult = {
        code: 500,
        message: 'Internal server error',
        chat: null,
      };

      const result = await resolver.createMessage(messageInputMock);

      expect(result).toEqual(expectedResult);
      expect(messageServiceMock.createMessage).toHaveBeenCalledWith(
        messageInputMock,
      );
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages and return them', async () => {
      const messages = [
        {
          id: 'messageId1',
          senderId: 'senderId1',
          receiverId: 'receiverId1',
          chatId: 'chatId1',
          content: 'Hello, world!',
          createdAt: new Date(),
        },
        {
          id: 'messageId2',
          senderId: 'senderId2',
          receiverId: 'receiverId2',
          chatId: 'chatId2',
          content: 'Hi there!',
          createdAt: new Date(),
        },
      ];

      messageServiceMock.getMessages.mockResolvedValue(messages);

      const expectedResult = {
        code: 200,
        message: 'Messages retrieved successfully',
        newmessage: messages,
      };

      const result = await resolver.getMessages();

      expect(result).toEqual(expectedResult);
      expect(messageServiceMock.getMessages).toHaveBeenCalled();
    });
  });
});
