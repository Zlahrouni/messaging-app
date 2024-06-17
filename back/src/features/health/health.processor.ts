import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Message } from './Message';

@Processor('chat')
export class HealthProcessor {
  @Process('welcome')
  async sendMessage(job: Job<Message>) {
    const { data } = job;

    console.log(`Job started: ${job.id}`);
    console.log(`Job data: ${JSON.stringify(data)}`);

    // send the welcome email here
    console.log(`Job completed: ${job.id}`);
  }
}
