import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MessageResolver } from './graphql/message/message.resolver';
import { MessageService } from './graphql/message/message.service';
import { MessageProcessor } from './graphql/message/message.processor';
import { ChatService } from './graphql/chat/chat.service';
import { ChatResolver } from './graphql/chat/chat.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './graphql/message/model/Message';
import { User } from './graphql/user/model/User';
import { Chat } from './graphql/chat/model/Chat';
import { UserResolver } from './graphql/user/user.resolver';
import { UserService } from './graphql/user/user.service';
import { ChatModule } from './graphql/chat/chat.module';
import { UserModule } from './graphql/user/user.module';
import { MessageModule } from './graphql/message/message.module';
import * as dotenv from 'dotenv';

dotenv.config();

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
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [User, Message, Chat],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Chat]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Message]),
    UserModule,
    MessageModule,
    ChatModule,
  ],
  providers: [
    UserResolver,
    UserService,
    MessageResolver,
    MessageService,
    MessageProcessor,
    ChatService,
    ChatResolver,
  ],
})
export class AppModule {}
