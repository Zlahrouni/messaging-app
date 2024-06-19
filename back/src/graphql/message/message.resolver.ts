import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { Message } from './model/Message';
import { MessageService } from './message.service';
import { MessageInput } from './dto/message.dto';

@Resolver(() => Message)
export class UserResolver {
  // resolver logic

  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  async createMessage(@Args('messageInput') MessageInput: MessageInput) {
    return this.messageService.createMessage(MessageInput);
  }

  @Query(() => [Message])
  async getMessages() {
    return this.messageService.getMessages();
  }
}
