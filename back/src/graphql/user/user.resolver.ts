import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '../models/User';
import { UserInput } from './user.dto';

@Resolver(() => User)
export class UserResolver {
  // resolver logic

  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('userInput') UserInput: UserInput) {
    return this.userService.createUser(UserInput);
  }

  @Query(() => [User])
  async getUsers() {
    return this.userService.getUsers();
  }
}
