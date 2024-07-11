import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './model/User';
import { ConflictException } from '@nestjs/common';
import { CreateOrSignUserResponse, GetUsersResponse } from './user.response';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user.
   *
   * @param email - The email of the user.
   *
   * @returns A response with a status code, message, and the created user (nullable).
   */
  @Mutation(() => CreateOrSignUserResponse)
  async createOrSignUser(@Args('email') email: string) {
    try {
      const createdUser = await this.userService.createOrSignUser(email);
      if (createdUser) {
        return {
          code: 201,
          message: 'User created',
          user: createdUser,
        };
      } else {
        return {
          code: 500,
          message: 'Internal server error',
          user: null,
        };
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          code: 409,
          message: error.message,
          user: null,
        };
      }
      throw error;
    }
  }

  /**
   * Retrieves all users.
   *
   * @returns A response with a status code, message, and a list of users (nullable).
   */
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
}
