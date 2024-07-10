import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { MessageInput } from './dto/message.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Message } from './model/Message';
import { verifyOAuthToken } from '../module/auth';
import { UserService } from '../user/user.service';
import {MessageResponse} from "./message.response";

@Resolver(() => Message)
export class MessageResolver {
  // resolver logic

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => MessageResponse)
  async createMessage(@Args('messageInput') messageInput: MessageInput) {
    const { token, receiveirEmail, content } = messageInput;
    try {
      const senderEmail = await verifyOAuthToken(token);
      if (!senderEmail) {
        return {
          code: 401,
          message: 'Unauthorized',
          messageCreated: null,
        };
      }

      const senderUser  = await this.userService.getUserByEmail(senderEmail);
      const receiverUser = await this.userService.getUserByEmail(receiveirEmail);

      if (senderUser === null) {
        return {
          code: 404,
          message: 'Sender not found',
          messageCreated: null,
        };
      }

        if (receiverUser === null) {
            return {
            code: 404,
            message: 'Receiver not found',
            messageCreated: null,
            };
        }
      const newMessage = await this.messageService.createMessage(senderUser.email, receiverUser.email, content);
      return {
        code: 200,
        message: 'Chat created successfully',
        messageCreated: newMessage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          code: 404,
          message: error.message,
          messageCreated: null,
        };
      } else if (error instanceof ConflictException) {
        return {
          code: 409,
          message: error.message,
          messageCreated: null,
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
