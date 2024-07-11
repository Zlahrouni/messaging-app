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
   * Creates a new user.
   * @returns The created user.
   * @param email - The email of the user.
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
   * Retrieves all users.
   * @returns A list of users (can be empty).
   */
  async getUsers(): Promise<User[]> {
    const users = await this.redis.keys('users:*');
    const userData = await Promise.all(users.map((key) => this.redis.get(key)));
    return userData.map((user) => {
      const parsedUser: User = JSON.parse(user!);
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
  async getUserByEmail(email: string): Promise<User | null> {
    //const users = await this.redis.keys('users:*');
    const usersDB = await this.userRepository.find({
      where: { email },
    });
    console.log(usersDB);
    return usersDB.length > 0 ? usersDB[0] : null;
  }
}
