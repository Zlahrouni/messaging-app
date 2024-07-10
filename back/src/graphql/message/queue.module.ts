// queue.module.ts ou message.module.ts
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messageSend',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
