import {inject} from '@loopback/core';
import {get, param, post, requestBody} from '@loopback/rest';
import {LangChainService} from 'loopback4-langchain';
import {RedisChatMessageHistory} from '@langchain/redis';
import {HumanMessage, AIMessage} from '@langchain/core/messages';

/**
 * A controller that provides chat functionality
 */
export class ChatController {
  constructor(
    @inject('services.LangChainService')
    private langchainService: LangChainService,
    @inject('services.RedisChatMessageHistory')
    private redisChatHistory: RedisChatMessageHistory,
  ) {}

  /**
   * Process a chat message
   */
  @post('/chat')
  async processChat(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The chat message',
              },
              sessionId: {
                type: 'string',
                description: 'The chat session ID',
              },
            },
            required: ['message', 'sessionId'],
          },
        },
      },
    })
    request: {
      message: string;
      sessionId: string;
    },
  ): Promise<object> {
    // Create a new history instance with the provided sessionId
    const history = new RedisChatMessageHistory({
      sessionId: request.sessionId,
      // The Redis connection details are inherited from the provider
      client: this.redisChatHistory.client,
    });

    // Add the user message to the history
    await history.addMessage(new HumanMessage(request.message));

    // Process the message using the LangChain service
    const chatModel = this.langchainService.getChatModel();
    const response = await chatModel.invoke(request.message);

    // Add the AI response to the history
    await history.addMessage(new AIMessage(response));

    return {
      sessionId: request.sessionId,
      response,
    };
  }

  /**
   * Get chat history
   */
  @get('/chat/{sessionId}')
  async getChatHistory(
    @param.path.string('sessionId') sessionId: string,
  ): Promise<object> {
    // Create a new history instance with the provided sessionId
    const history = new RedisChatMessageHistory({
      sessionId,
      // The Redis connection details are inherited from the provider
      client: this.redisChatHistory.client,
    });

    // Get all messages from the history
    const messages = await history.getMessages();

    return {
      sessionId,
      messages: messages.map(msg => ({
        type: msg._getType(),
        content: msg.content,
      })),
    };
  }

  /**
   * Clear chat history
   */
  @get('/chat/{sessionId}/clear')
  async clearChatHistory(
    @param.path.string('sessionId') sessionId: string,
  ): Promise<object> {
    // Create a new history instance with the provided sessionId
    const history = new RedisChatMessageHistory({
      sessionId,
      // The Redis connection details are inherited from the provider
      client: this.redisChatHistory.client,
    });

    // Clear the history
    await history.clear();

    return {
      success: true,
      message: 'Chat history cleared',
    };
  }
}
