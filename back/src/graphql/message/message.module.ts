import { forwardRef, Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { ChatService } from '../chat/chat.service';
import { UserService } from '../user/user.service';
import { MessageService } from './message.service';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './model/Message';
import { MessageResolver } from './message.resolver';
import { User } from '../user/model/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => ChatModule),
    BullModule.registerQueue({
      name: 'messageSend',
    }),
  ],
  providers: [ChatService, UserService, MessageService, MessageResolver],
  exports: [MessageService, ChatService],
})
export class MessageModule {}
