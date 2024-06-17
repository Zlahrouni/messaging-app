import {Query} from "@nestjs/graphql";

export class HealthCheckResolver {
  @Query(() => String)
  check() {
    return 'OK';
  }
}