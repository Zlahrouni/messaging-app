import { Module } from '@nestjs/common';
import { HealthController } from './features/health/health.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserResolver } from './graphql/resolvers/UserResolver';
import { HealthCheckResolver } from './graphql/resolvers/HealthCheckResolver';
import { BullModule } from '@nestjs/bull';
import { HealthService } from './features/health/health.service';
import { HealthProcessor } from './features/health/health.processor';
import { HealthResolver } from './graphql/resolvers/Health.resolver';

@Module({
  imports: [
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
  controllers: [HealthController],
  providers: [
    UserResolver,
    HealthCheckResolver,
    HealthService,
    HealthProcessor,
    HealthResolver
  ],
})
export class AppModule {}
