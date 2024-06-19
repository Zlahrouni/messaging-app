import { Resolver } from '@nestjs/graphql';
import { Chat } from './model/Chat';
import { ChatService } from './chat.service';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}
}
