import {ConflictException, Injectable} from '@nestjs/common';
import {Redis} from 'ioredis';
import {User} from "./model/User";

@Injectable()
export class UserService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  /**
   * Creates a new user.
   * @returns The created user.
   * @param email - The email of the user.
   * @throws ConflictException if the email already exists.
   */
  async createUser(email: string) {
    const userExist = await this.getUserByEmail(email)

    if (userExist != null) {
      throw new ConflictException('Email already exists');
    }

    const newUser: User = {
      email: email,
      createdAt:  new Date(),
    };
    this.redis.set(`users:${newUser.email}`, JSON.stringify(newUser));
    return newUser;
  }

  /**
   * Retrieves all users.
   * @returns A list of users (can be empty).
   */
  async getUsers(): Promise<User[]> {
    const users = await this.redis.keys('users:*');
    const userData = await Promise.all(users.map((key) => this.redis.get(key)));
    return userData.map((user) => {
      const parsedUser : User = JSON.parse(user!);
      // !Important! Convert date back to a Date object
      parsedUser.createdAt = new Date(parsedUser.createdAt);
      return parsedUser;
    });
  }

  /**
   * Retrieves a user by email.
   * @param email - The email of the user.
   * @returns The user with the given email or null if no user was found.
   */
  async getUserByEmail(email: string) : Promise<User | null> {
    const users = await this.redis.keys('users:*');
    const userData = await Promise.all(users.map((key) => this.redis.get(key)));
    const user = userData.find((user) => {
      const parsedUser : User = JSON.parse(user!);
      return parsedUser.email === email;
    });
    return user ? JSON.parse(user) : null;
  }

}
