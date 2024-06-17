import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Message } from './Message';

@Injectable()
export class HealthService {
  constructor(@InjectQueue('chat') private readonly messageQueue: Queue) {}

  async sendMessage(data: Message) {
    const job = await this.messageQueue.add('welcome', data);
    return { jobId: job.id };
  }
}
