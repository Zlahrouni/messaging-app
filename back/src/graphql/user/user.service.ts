import { Injectable } from '@nestjs/common';
import { UserInput } from './dto/user.dto';
import { Redis } from 'ioredis';

@Injectable()
export class UserService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async createUser(userdto: UserInput) {
    const userId = Math.random().toString(36).substring(7);
    this.redis.set(`users: ${userId}`, JSON.stringify(userdto));
    return userdto;
  }

  async getUsers() {
    const users = await this.redis.keys('users:*');
    const userData = await Promise.all(users.map((key) => this.redis.get(key)));
    return userData.map((user) => JSON.parse(user!));
  }
}
