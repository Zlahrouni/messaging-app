import { Injectable } from '@nestjs/common';
import { UserInput } from './user.dto';
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
    this.redis.set('user', JSON.stringify(userdto));
    return userdto;
  }

  async getUsers() {
    return this.redis.get('user');
  }
}
