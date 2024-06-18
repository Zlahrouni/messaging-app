import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { MessageDTO } from './message.dto';

@Injectable()
export class HealthService {
  constructor(@InjectQueue('chat') private readonly messageQueue: Queue) {}

  async sendMessage(data: MessageDTO) {
    const job = await this.messageQueue.add('welcome', data);
    return { jobId: job.id };
  }
}
