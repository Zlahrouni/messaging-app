import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { MessageDTO } from '../../features/health/message.dto';
import { HealthService } from '../../features/health/health.service';

@Resolver('Health')
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Mutation(() => String)
  async sendMessage(@Args('message') message: MessageDTO): Promise<string> {
    console.log(message);
    const result = await this.healthService.sendMessage(message);
    console.log(`Job added with id: ${result.jobId}`);
    return 'Message received';
  }
}
