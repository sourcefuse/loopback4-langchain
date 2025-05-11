import {lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'Redis',
  connector: 'redis',
  // Redis connection details
  // These can be overridden by environment variables
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  // Optional configurations
  db: process.env.REDIS_DB || 0,
  // Additional settings for chat history
  ttl: process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL) : undefined,
  prefix: process.env.REDIS_PREFIX || 'langchain:chat_history:',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RedisDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Redis';
  static readonly defaultConfig = config;

  constructor(dsConfig: object = config) {
    super(dsConfig);
  }
}
