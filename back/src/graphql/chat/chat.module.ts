import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { MessageModule } from '../message/message.module';
import { MessageService } from '../message/message.service';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './model/Chat';
import { User } from '../user/model/User';
import { Message } from '../message/model/Message';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => MessageModule),
    BullModule.registerQueue({
      name: 'messageSend',
    }),
  ],
  providers: [ChatService, UserService, MessageService],
  exports: [ChatService],
})
export class ChatModule {}
