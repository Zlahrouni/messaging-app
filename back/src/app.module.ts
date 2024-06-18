import { Module } from '@nestjs/common';
import { HealthController } from './features/health/health.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserResolver } from './graphql/resolvers/UserResolver';
import { HealthCheckResolver } from './graphql/resolvers/HealthCheckResolver';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HealthService } from './features/health/health.service';
import { HealthProcessor } from './features/health/health.processor';
import { CacheController } from './redis/cache.controler';
import { CacheService } from './redis/cache.service';
import { redisClientFactory } from './redis/redis.client.factory';

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
      name: 'chat',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
    }),
  ],
  controllers: [HealthController, CacheController],
  providers: [
    UserResolver,
    HealthCheckResolver,
    HealthService,
    HealthProcessor,
    CacheService,
    {
      provide: 'RedisClient',
      useFactory: redisClientFactory.useFactory,
    },
  ],
})
export class AppModule {}
