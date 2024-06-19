import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ChatService {
  constructor(@InjectQueue('messageSend') private newMessageQueue: Queue) {}

  async createChat() {
    // create chat logic
  }

  async getChats() {
    // get chats logic
  }

  async getChatById() {
    // get chat by id logic
  }
}
