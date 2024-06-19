import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { Message } from './model/Message';

@Resolver(() => Message)
export class UserResolver {
  // resolver logic

  constructor(private readonly userService: MessageService) {}

  @Mutation(() => Message)
  async createUser(@Args('userInput') UserInput: UserInput) {
    return this.userService.createUser(UserInput);
  }

  @Query(() => [Message])
  async getUsers() {
    return this.userService.getUsers();
  }
}