import {Provider, inject} from '@loopback/core';
import {RedisChatMessageHistory} from '@langchain/redis';
import {juggler} from '@loopback/repository';
import {BindingScope, injectable} from '@loopback/core';

/**
 * This class provides a RedisChatMessageHistory instance that uses
 * the Redis datasource provided by the application.
 */
@injectable({scope: BindingScope.SINGLETON})
export class RedisChatMessageHistoryProvider implements Provider<RedisChatMessageHistory> {
  constructor(
    @inject('datasources.Redis', {optional: true})
    private redisDataSource?: juggler.DataSource,
  ) {}

  /**
   * Value method to return the RedisChatMessageHistory instance
   */
  value(): RedisChatMessageHistory {
    if (!this.redisDataSource) {
      throw new Error(
        'Redis datasource is required for RedisChatMessageHistory. ' +
        'Please configure a Redis datasource in your application with the name "Redis". ' +
        'Example configuration:\n' +
        '1. Create a file named redis.datasource.ts in your src/datasources directory\n' +
        '2. Configure it with the following settings:\n' +
        '   - name: "Redis"\n' +
        '   - connector: "redis"\n' +
        '   - url: process.env.REDIS_URL (optional)\n' +
        '   - host: process.env.REDIS_HOST || "localhost"\n' +
        '   - port: process.env.REDIS_PORT || 6379\n' +
        '   - password: process.env.REDIS_PASSWORD (if required)\n' +
        '   - db: process.env.REDIS_DB || 0\n' +
        '3. Make sure to install the required dependencies: npm install loopback-connector-redis'
      );
    }

    // Extract Redis connection details from the datasource
    const config = this.redisDataSource.settings || {};

    // Create and return a RedisChatMessageHistory instance
    // The sessionId will be provided by the consumer when using this provider
    // Create and return a RedisChatMessageHistory instance with required sessionId
    // Only include the sessionId which is required, and let the Redis client be created internally
    return new RedisChatMessageHistory({
      sessionId: 'default', // This will be overridden by the consumer
      // Only include the prefix if it's defined
      ...(config.prefix ? { prefix: config.prefix } : {}),
    });
  }
}
