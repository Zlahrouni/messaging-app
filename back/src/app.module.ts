import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserResolver } from './graphql/user/user.resolver';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UserService } from './graphql/user/user.service';
import { MessageResolver } from './graphql/message/message.resolver';
import { MessageService } from './graphql/message/message.service';
import { MessageProcessor } from './graphql/message/message.processor';
import { ChatService } from './graphql/chat/chat.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'messageSend',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
    }),
  ],
  providers: [
    UserResolver,
    UserService,
    MessageResolver,
    MessageService,
    MessageProcessor,
    ChatService,
  ],
})
export class AppModule {}
