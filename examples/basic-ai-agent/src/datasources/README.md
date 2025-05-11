# Datasources

This directory contains config for datasources used by this app.

## Redis DataSource

The Redis datasource connects to a Redis server for storing chat message history using LangChain's RedisChatMessageHistory.

### Configuration

The Redis connection can be configured using environment variables:

- `REDIS_URL`: Full Redis URL (e.g., `redis://user:password@host:port`). If provided, this takes precedence over individual settings.
- `REDIS_HOST`: Redis server hostname (default: `localhost`)
- `REDIS_PORT`: Redis server port (default: `6379`)
- `REDIS_PASSWORD`: Redis server password (if required)
- `REDIS_DB`: Redis database number (default: `0`)
- `REDIS_TTL`: Time-to-live for chat messages in seconds (optional)
- `REDIS_PREFIX`: Key prefix for chat history (default: `langchain:chat_history:`)

### Usage with RedisChatMessageHistory

The Redis datasource is automatically used by the RedisChatMessageHistory provider. You can inject and use it in your controllers or services:

```typescript
import {inject} from '@loopback/core';
import {RedisChatMessageHistory} from '@langchain/redis';

export class MyController {
  constructor(
    @inject('services.RedisChatMessageHistory')
    private redisChatHistory: RedisChatMessageHistory,
  ) {}

  async someMethod() {
    // Create a session-specific history instance
    const history = new RedisChatMessageHistory({
      sessionId: 'user-123',
      client: this.redisChatHistory.client,
    });

    // Use the history
    await history.addMessage(/* ... */);
    const messages = await history.getMessages();
  }
}
```

See the `RedisChatHistoryExampleController` for a complete example.
