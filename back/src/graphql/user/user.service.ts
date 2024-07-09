import {ConflictException, Injectable} from '@nestjs/common';
import {UserInput} from './dto/user.dto';
import {Redis} from 'ioredis';
import {v4 as uuidv4} from 'uuid';
import {User} from "./model/User";
import {comparePasswords, createJWT, hashPassword} from "../module/auth";

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
   * @param userdto - Input data for creating a new user (username & password).
   * @returns The created user.
   * @throws ConflictException if the username already exists.
   */
  async createUser(userdto: UserInput) {
    const userExist = await this.getUserByUsername(userdto.username)

    if (userExist != null) {
      throw new ConflictException('Username already exists')
    }

    const newUser: User = {
      id: uuidv4(),
      username: userdto.username,
      password: await hashPassword(userdto.password),
      createdAt:  new Date(),
    };
    this.redis.set(`users:${newUser.id}`, JSON.stringify(newUser));
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
      const parsedUser = JSON.parse(user!);
      // !Import! Convert date back to a Date object
      parsedUser.createdAt = new Date(parsedUser.createdAt);
      return parsedUser;
    });
  }

  /**
   * Signs in a user.
   * @param userInput - Input data for signing in a user (username & password).
   * @returns A JWT token.
   * @throws ConflictException if the username or password is invalid.
   */
  async signIn(userInput: UserInput) {
    const user = await this.getUserByUsername(userInput.username);

    if (user == null) {
      throw new ConflictException('Invalid username or password');
    }
    if (!await comparePasswords(userInput.password, user.password)) {
      throw new ConflictException('Invalid username or password');
    }

    return createJWT({id: user.id, username: user.username});
  }

  /**
   * Retrieves a user by ID.
   * @param userId - The ID of the user.
   * @returns The user with the given ID.
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await this.redis.get(`users:${userId}`);
    return JSON.parse(user!);
  }

  /**
   * Retrieves a user by username.
   * @param username - The username of the user.
   * @returns The user with the given username or null if no user was found.
   */
  async getUserByUsername(username: string) : Promise<User | null> {
    const users = await this.redis.keys('users:*');
    const userData = await Promise.all(users.map((key) => this.redis.get(key)));
    const user = userData.find((user) => {
      const parsedUser = JSON.parse(user!);
      return parsedUser.username === username;
    });
    return user ? JSON.parse(user) : null;
  }

  /**
   * Retrieves all user IDs.
   * @returns A list of user IDs (e.g ["id1", "di2"]) or an empty string.
   */
  async getIds() {
    const userIDs = await this.redis.keys('users:*');
    return userIDs.map((key) => key.split(':')[1]);
  }
}
