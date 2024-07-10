import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { MessageInput } from './dto/message.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Message } from './model/Message';
import { verifyOAuthToken } from '../module/auth';
import { UserService } from '../user/user.service';

@Resolver(() => Message)
export class MessageResolver {
  // resolver logic

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => Message)
  async createMessage(@Args('messageInput') messageInput: MessageInput) {
    const { token } = messageInput;
    try {
      const userEmail = await verifyOAuthToken(token);
      if (!userEmail) {
        return {
          code: 401,
          message: 'Unauthorized',
          chat: null,
        };
      }
      const newMessage = await this.messageService.createMessage(messageInput);
      return {
        code: 200,
        message: 'Chat created successfully',
        newMessage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          code: 404,
          message: error.message,
          chat: null,
        };
      } else if (error instanceof ConflictException) {
        return {
          code: 409,
          message: error.message,
          chat: null,
        };
      }

      return {
        code: 500,
        message: 'Internal server error',
        chat: null,
      };
    }
  }

  @Query(() => [Message])
  async getMessages(
    @Args('token') token: string,
    @Args('chatId') chatId: string,
  ) {
    try {
      const email = await verifyOAuthToken(token);
      let user;
      if (email) {
        user = await this.userService.getUserByEmail(email);
      }

      if (!user) {
        return {
          code: 404,
          message: 'User not found',
          chats: [],
        };
      }

      return {
        code: 200,
        message: 'Messages retrieved successfully',
        newmessage: await this.messageService.getMessages(chatId),
      };
    } catch (e) {
      return {
        code: 401,
        message: e.message,
        chats: [],
      };
    }
  }
}
