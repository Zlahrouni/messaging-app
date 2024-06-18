import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MessageDTO } from './message.dto';

@Processor('chat')
export class HealthProcessor {
  @Process('welcome')
  async sendMessage(job: Job<MessageDTO>) {
    console.log(`sendMessage called with job id: ${job.id}`);
    try {
      const { data } = job;

      console.log(`Job started: ${job.id}`);
      console.log(`Job data: ${JSON.stringify(data)}`);

      // send the welcome email here
      console.log(`Job completed: ${job.id}`);
    } catch (error) {
      console.error(`Error processing job ${job.id}: ${error.message}`);
    }
  }
}
