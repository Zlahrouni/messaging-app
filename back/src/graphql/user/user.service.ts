import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { User } from './model/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private redis: Redis;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  /**
   * Creates a new user or signs in an existing user based on the provided email in Redis cache and database.
   *
   * @returns The created user.
   *
   * @param email - The email address of the user to create or sign in.
   *
   * @returns The created or signed-in user.
   *
   * @throws ConflictException if the email already exists.
   */
  async createOrSignUser(email: string) {
    const userExist = await this.getUserByEmail(email);
    if (userExist) {
      userExist.createdAt = new Date(userExist.createdAt);
      return userExist;
    }

    const newUser: User = {
      email: email,
      createdAt: new Date(),
    };
    const userSavedDB = await this.userRepository.save(newUser);
    if (userSavedDB) {
      return userSavedDB;
    }
    await this.redis.set(`users:${newUser.email}`, JSON.stringify(newUser));
    return newUser;
  }

  /**
   * Retrieves all users from both the Redis cache and the database.
   *
   * @returns A list of users and it can be empty if no users are found..
   */
  async getUsers(): Promise<User[]> {
    const users = await this.redis.keys('users:*');

    if (users.length > 0) {
      const userData = await Promise.all(
        users.map((key) => this.redis.get(key)),
      );
      return userData.map((user) => {
        const parsedUser: User = JSON.parse(user!);
        // !Important! Convert date back to a Date object
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        return parsedUser;
      });
    } else {
      const usersDB = await this.userRepository.find();
      return usersDB;
    }
  }

  /**
   * Retrieves a user by email from both the Redis cache and the database.
   *
   * @param email - The email of the user.
   *
   * @returns The user with the given email or null if no user was found.
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.redis.keys('users:*');

    if (users.length > 0) {
      const userData = await Promise.all(
        users.map((key) => this.redis.get(key)),
      );
      const user = userData.find((user) => {
        const parsedUser: User = JSON.parse(user!);
        return parsedUser.email === email;
      });
      return user ? JSON.parse(user!) : null;
    } else {
      const usersDB = await this.userRepository.find({
        where: { email },
      });
      return usersDB.length > 0 ? usersDB[0] : null;
    }
  }
}
