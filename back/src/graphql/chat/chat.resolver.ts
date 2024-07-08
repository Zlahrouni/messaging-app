import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import { Chat } from './model/Chat';
import { ChatService } from './chat.service';
import {CreateChatResponse, GetChatByUsernameResponse} from "./chat.response";
import {ChatInput} from "./dto/chat.dto";
import {getUser, JWTUser} from "../module/auth";
import {ConflictException, NotFoundException} from "@nestjs/common";

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => CreateChatResponse)
  async createChat(@Args('chatInput') chatInput: ChatInput) {

    const user = getUser(chatInput.token);

    if (!user) {
        return {
          code: 401,
          message: 'Unauthorized',
          chat: null
        }
    }
    try {
        return {
            code: 200,
            message: 'Chat created successfully',
            chat: await this.chatService.createChat(chatInput),
        };
        } catch (error) {
        if (error instanceof NotFoundException) {
            return {
                code: 404,
                message: error.message,
                chat: null
            }
        } else if (error instanceof ConflictException) {
            return {
                code: 409,
                message: error.message,
                chat: null
            }
        }

        return {
          code: 500,
          message: 'Internal server error',
          chat: null
        }
    }
  }

  // FIXME : need to pass token instead of username
  @Query(() => GetChatByUsernameResponse)
  async getChats(@Args('username') username: string) {
      return {
        code: 200,
        message: 'Chat retrieved successfully',
        chat: this.chatService.getChatByUsername(username)
      };
  }
}
