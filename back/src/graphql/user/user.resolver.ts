import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './model/User';
import { UserInput } from './dto/user.dto';
import {ConflictException} from "@nestjs/common";
import {CreateUserResponse, GetUsersResponse, SignInResponse} from "./user.response";


@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => CreateUserResponse)
  async createUser(@Args('userInput') userInput: UserInput) {
    try {
        return {
          code: 200,
          message: 'User created successfully',
          user: await this.userService.createUser(userInput),
        };
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          code: 409,
          message: error.message,
          user: null
        }
      }
      throw error;
    }
  }

  @Query(() => GetUsersResponse)
  async getUsers(): Promise<GetUsersResponse> {
    try {
      const users = await this.userService.getUsers();
      return {
        code: 200,
        message: users.length > 0 ? 'Users found' : 'No users found',
        users: users || [],
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Internal server error',
        users: [],
      };
    }
  }

  @Query(() => SignInResponse)
  async signIn(@Args('userInput') userInput: UserInput) {

    try {
      const token = await this.userService.signIn(userInput);
      return {
        code: 200,
        message: 'User signed in successfully',
        token: token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          code: 409,
          message: error.message,
          token: null
        }
      }

      return {
        code: 401,
        message: 'Invalid username or password',
        token: null,
      };
    }
  }
}
