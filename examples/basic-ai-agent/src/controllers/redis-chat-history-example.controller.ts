import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {RedisChatMessageHistory} from '@langchain/redis';
import {HumanMessage, AIMessage} from '@langchain/core/messages';

/**
 * A controller that demonstrates how to use the RedisChatMessageHistory provider
 */
export class RedisChatHistoryExampleController {
  constructor(
    @inject('services.RedisChatMessageHistory')
    private redisChatHistory: RedisChatMessageHistory,
  ) {}

  /**
   * Add a message to the chat history
   */
  @get('/chat-history/{sessionId}/add')
  async addMessage(
    @param.path.string('sessionId') sessionId: string,
    @param.query.string('message') message: string,
    @param.query.boolean('isAi') isAi = false,
  ): Promise<object> {
    // Create a new history instance with the provided sessionId
    const history = new RedisChatMessageHistory({
      sessionId,
      // The Redis connection details are inherited from the provider
      client: this.redisChatHistory.client,
    });

    // Add the message to the history
    if (isAi) {
      await history.addMessage(new AIMessage(message));
    } else {
      await history.addMessage(new HumanMessage(message));
    }

    return {success: true, message: 'Message added to history'};
  }

  /**
   * Get all messages from the chat history
   */
  @get('/chat-history/{sessionId}')
  async getMessages(
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
   * Clear the chat history
   */
  @get('/chat-history/{sessionId}/clear')
  async clearHistory(
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

    return {success: true, message: 'Chat history cleared'};
  }
}
