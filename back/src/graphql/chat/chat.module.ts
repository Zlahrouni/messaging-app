import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { ChatProcessor } from './chat.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messageSend',
    }),
    BullModule.registerQueue({
      name: 'messageRecieved',
    }),
  ],
  providers: [ChatService, ChatResolver, ChatProcessor],
})
export class ChatModule {}
