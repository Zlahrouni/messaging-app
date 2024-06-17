import { Controller, Post, Body } from '@nestjs/common';
import { Message } from './Message';
@Controller('health')
export class HealthController {
  @Post('send')
  receiveMessage(@Body() message: Message) {
    // Handle the incoming message here
    console.log(message);
    return 'Message received';
  }
}
