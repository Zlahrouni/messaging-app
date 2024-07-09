import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import { Chat } from './model/Chat';
import { ChatService } from './chat.service';
import { GetChatByUsernameResponse } from "./chat.response";
import {getUser} from "../module/auth";


@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}


  /**
  *  Retreives all chats for a user.
  *  @param token - The token of the user.
   * @returns A response with a status code, message, and a list of chats (nullable).
  */
  @Query(() => GetChatByUsernameResponse)
  async getChats(@Args('token') token: string) {
      const user = getUser(token)
      if(user == null) {
          return {
              code: 401,
              message: 'Unauthorized',
              chat: null
          }
      }
      return {
        code: 200,
        message: 'Chat retrieved successfully',
        chat: this.chatService.getChatsByUsername(user.username)
      };
  }
}
