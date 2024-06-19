import { Process, Processor } from '@nestjs/bull';
import { MessageService } from './message.service';
import { Job } from 'bull';

@Processor('messageSend')
export class MessageProcessor {
  constructor(private readonly messageService: MessageService) {}
  @Process('newMessage')
  async handleNewmessages(job: Job) {
    console.log('Processing job ...');
    await this.messageService.processNewMessage(job.data);
    console.log('Job processed');
  }
}
