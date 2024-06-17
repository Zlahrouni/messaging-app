import { Controller, Post, Body } from '@nestjs/common';
import { Message } from './Message';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('send')
  async handleSendMessage(@Body() message: Message) {
    console.log(message);
    const result = await this.healthService.sendMessage(message);
    console.log(`Job added with id: ${result.jobId}`);
    return 'Message received';
  }
}
