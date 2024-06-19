import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ChatService {
  constructor(
    @InjectQueue('messageSend') private newMessageQueue: Queue,
    @InjectQueue('messageRecieved') private messageSendQueue: Queue,
  ) {}

  async createChat() {
    // create chat logic
  }

  async sendMessage() {
    // send message logic
  }

  async getChats() {
    // get chats logic
  }

  async processNewMessage() {
    // process new message logic
  }
}
