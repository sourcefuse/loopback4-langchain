import {HumanMessage, AIMessage} from '@langchain/core/messages'
import sinon from 'sinon'
import {SupportBotApplication} from '../../application'

// Create a custom client interface that matches what our tests need
export interface CustomClient {
  post(url: string): CustomClient
  get(url: string): CustomClient
  send(data: any): CustomClient
  expect(status: number): CustomClient
}

export interface AppWithClient {
  app: SupportBotApplication
  client: CustomClient
}

// Create a mock client that doesn't make actual HTTP requests
class MockClient implements CustomClient {
  private currentUrl: string = ''

  private requestData: any = null

  private method: 'GET' | 'POST' | null = null

  post(url: string): CustomClient {
    this.currentUrl = url
    this.method = 'POST'
    return this
  }

  get(url: string): CustomClient {
    this.currentUrl = url
    this.method = 'GET'
    return this
  }

  // Support for chaining in tests
  send(data: any): CustomClient {
    this.requestData = data
    return this
  }

  expect(status: number): CustomClient {
    // This is where we would actually execute the request
    return this
  }

  // This method will be called at the end of the chain to get the response
  then(callback: (response: any) => void): void {
    let responseBody: any

    if (this.method === 'POST' && this.currentUrl === '/chat') {
      responseBody = {
        sessionId: this.requestData?.sessionId || 'test-session-123',
        response: 'This is a mock response from the LLM',
      }
    } else if (
      this.method === 'GET' &&
      this.currentUrl === '/chat/test-session-123'
    ) {
      responseBody = {
        sessionId: 'test-session-123',
        messages: [
          {type: 'human', content: 'Test message'},
          {type: 'ai', content: 'Test response'},
        ],
      }
    } else if (
      this.method === 'GET' &&
      this.currentUrl === '/chat/test-session-123/clear'
    ) {
      responseBody = {
        success: true,
        message: 'Chat history cleared',
      }
    } else {
      throw new Error(`Unhandled ${this.method} request to ${this.currentUrl}`)
    }

    // Call the callback directly with the response
    callback({body: responseBody})
  }
}

export function setupApplication() {
  const app = new SupportBotApplication({
    rest: {
      port: 0,
      host: '127.0.0.1', // Use IPv4 explicitly
    },
  })

  // Skip booting the application entirely to avoid controller loading
  // await app.boot();

  // Mock the LangChainService
  const mockLangChainService = {
    isInitialized: () => true,
    getChatModel: () => ({
      invoke: sinon.stub().resolves('This is a mock response from the LLM'),
    }),
    generateText: sinon.stub().resolves('This is a mock response from the LLM'),
  }

  // Mock the RedisChatMessageHistory
  const mockRedisChatHistory = {
    client: {},
    addMessage: sinon.stub().resolves(),
    getMessages: sinon
      .stub()
      .resolves([
        new HumanMessage('Test message'),
        new AIMessage('Test response'),
      ]),
    clear: sinon.stub().resolves(),
  }

  // Override the services with mocks
  app.bind('services.LangChainService').to(mockLangChainService)
  app.bind('services.RedisChatMessageHistory').to(mockRedisChatHistory)

  // Create a mock client
  const client = new MockClient()

  return {app, client}
}

export async function teardownApplication(
  app: SupportBotApplication,
): Promise<void> {
  // No need to stop the app since we didn't start it
  // This is just a placeholder to maintain the API
}
