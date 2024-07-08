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

  async createUser(userdto: UserInput) {
    const userExist = await this.redis.get(`username:${userdto.username}`)

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
    this.redis.set(`username:${newUser.username}`, newUser.id);

    return newUser;
  }

  async getUsers() {
    const users = await this.redis.keys('users:*');
    const userData = await Promise.all(users.map((key) => this.redis.get(key)));
    return userData.map((user) => {
      const parsedUser = JSON.parse(user!);
      // !Import! Convert date back to a Date object
      parsedUser.createdAt = new Date(parsedUser.createdAt);
      return parsedUser;
    });
  }

  async getIds() {
    const userIDs = await this.redis.keys('users:*');
    return userIDs.map((key) => key.split(':')[1]);
  }

  async signIn(userInput: UserInput) {
    const userId = await this.redis.get(`username:${userInput.username}`);
    if (userId == null) {
      throw new ConflictException('Invalid username or password');
    }

    const user = await this.redis.get(`users:${userId}`);

    if (user == null) {
      throw new ConflictException('Invalid username or password');
    }
    const userObj = JSON.parse(user) as User;
    if (!await comparePasswords(userInput.password, userObj.password)) {
      throw new ConflictException('Invalid username or password');
    }

    return createJWT({id: userObj.id, username: userObj.username});
  }

  async getUserById(userId: string) {
    const user = await this.redis.get(`users:${userId}`);
    return JSON.parse(user!);
  }
}
