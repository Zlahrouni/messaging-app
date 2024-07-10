import { Args, Query, Resolver } from '@nestjs/graphql';
import { Chat } from './model/Chat';
import { ChatService } from './chat.service';
import { GetChatsByUsernameResponse } from './chat.response';
import { verifyOAuthToken } from '../module/auth';
import { UserService } from '../user/user.service';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  /**
   *  Retreives all chats for a user.
   *  @param token - The token of the user.
   * @returns A response with a status code, message, and a list of chats (nullable).
   */
  @Query(() => GetChatsByUsernameResponse)
  async getMyChats(@Args('token') token: string) {
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

      const chats = await this.chatService.getChatsByEmail(user.email);

      return {
        code: 200,
        message: 'Success',
        chats: chats,
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
