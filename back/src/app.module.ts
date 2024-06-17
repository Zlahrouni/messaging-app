import { Module } from '@nestjs/common';
import {HealthController} from "./features/health/health.controller";
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {UserResolver} from "./graphql/resolvers/UserResolver";
import {HealthCheckResolver} from "./graphql/resolvers/HealthCheckResolver";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql'
    }),
  ],
  controllers: [HealthController],
  providers: [UserResolver, HealthCheckResolver],
})
export class AppModule {}
