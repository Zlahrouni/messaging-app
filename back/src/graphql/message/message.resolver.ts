import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { Message } from './model/Message';
import { MessageService } from './message.service';
import { MessageInput } from './dto/message.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

@Resolver(() => Message)
export class MessageResolver {
  // resolver logic

  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  async createMessage(@Args('messageInput') messageInput: MessageInput) {
    try {
      return {
        code: 200,
        message: 'Chat created successfully',
        newmessage: await this.messageService.createMessage(messageInput),
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
  async getMessages() {
    return {
      code: 200,
      message: 'Messages retrieved successfully',
      newmessage: await this.messageService.getMessages(),
    };
  }
}
