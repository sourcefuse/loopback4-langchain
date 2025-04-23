import {BindingScope, injectable} from '@loopback/core';
import {ChatGroq} from '@langchain/groq';

/**
 * LangChain service options
 */
export interface LangChainOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

@injectable({scope: BindingScope.SINGLETON})
export class LangChainService {
  private chatModel: ChatGroq;

  constructor(options: LangChainOptions = {}) {
    const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
    // Default to Llama 3 8B model
    const modelName = options.model ?? 'llama3-8b-8192';
    const temperature = options.temperature ?? 0.7;

    // Initialize Groq chat model
    this.chatModel = new ChatGroq({
      apiKey: apiKey,
      model: modelName,
      temperature: temperature,
    });
  }

  /**
   * Get the LangChain Groq chat model instance
   */
  getChatModel(): ChatGroq {
    return this.chatModel;
  }

  /**
   * Generate text using the chat model
   * @param prompt Text prompt
   */
  async generateText(prompt: string): Promise<string> {
    const response = await this.chatModel.invoke(prompt);
    return response.content.toString();
  }

  /**
   * Check if the LangChain service is properly initialized
   */
  isInitialized(): boolean {
    return !!this.chatModel;
  }
}
