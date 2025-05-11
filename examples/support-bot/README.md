# Support Bot

This is a demo LoopBack application that provides a chat API for a support bot. The application uses the LangChain component to interact with language models.

## Prerequisites

- Node.js (v18 or later)
- Redis server (for chat history storage)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables (optional):
   ```bash
   # LLM configuration
   export GROQ_API_KEY=your_groq_api_key

   # Redis configuration (optional, defaults to localhost:6379)
   export REDIS_HOST=localhost
   export REDIS_PORT=6379
   export REDIS_PASSWORD=your_redis_password
   ```

## Running the application

```bash
# From the repository root
npm run dev -w=support-bot

# Or from the support-bot directory
npm run dev
```

The application will be available at http://127.0.0.1:3000.

## API Endpoints

### Send a message

`POST /chat`

Send a message to the chat bot and get a response.

**Request:**
```json
{
  "message": "Hello, I need help with my order",
  "sessionId": "user123"
}
```

**Response:**
```json
{
  "sessionId": "user123",
  "response": "Hello! I'd be happy to help with your order. Could you please provide your order number so I can look up the details?"
}
```

### Get chat history

`GET /chat/{sessionId}`

Retrieve the chat history for a specific session.

**Response:**
```json
{
  "sessionId": "user123",
  "messages": [
    {
      "type": "human",
      "content": "Hello, I need help with my order"
    },
    {
      "type": "ai",
      "content": "Hello! I'd be happy to help with your order. Could you please provide your order number so I can look up the details?"
    }
  ]
}
```

### Clear chat history

`GET /chat/{sessionId}/clear`

Clear the chat history for a specific session.

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

## API Explorer

You can explore the API using the built-in Swagger UI at http://127.0.0.1:3000/explorer.
