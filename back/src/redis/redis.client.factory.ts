import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { config } from 'dotenv';
config();

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (!redisHost || !redisPort) {
      throw new Error(
        'REDIS_HOST and REDIS_PORT environment variables must be set',
      );
    }

    const redisInstance = new Redis({
      host: redisHost,
      port: +redisPort,
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [],
};
