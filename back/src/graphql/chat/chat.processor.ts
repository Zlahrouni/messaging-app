import { Process, Processor } from '@nestjs/bull';
import { ChatService } from './chat.service';
import { Job } from 'bull';

@Processor('chat')
export class ChatProcessor {
  //constructor(private readonly chatService: ChatService) {}
  //@Process('newMessage')
  //async handleNewmessages(job: Job) {
  //  await this.chatService.processNewMessage(job.data);
  //}
}
