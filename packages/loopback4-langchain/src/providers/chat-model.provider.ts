import {Provider, inject, BindingScope, injectable} from '@loopback/core'
import {BaseChatModel} from '@langchain/core/language_models/chat_models'
import {ChatOpenAI} from '@langchain/openai'
import {ChatAnthropic} from '@langchain/anthropic'
import {CHAT_MODEL_OPTIONS} from '../keys'

/**
 * Chat model provider types
 */
export type ChatModelType = 'openai' | 'anthropic'

/**
 * Chat model options
 */
export interface ChatModelOptions {
  provider?: ChatModelType
  apiKey?: string
  model?: string
  temperature?: number
}

/**
 * This class provides a BaseChatModel instance that can be either
 * OpenAI or Anthropic based on the configuration.
 */
@injectable({scope: BindingScope.SINGLETON})
export class ChatModelProvider implements Provider<BaseChatModel> {
  constructor(
    @inject(CHAT_MODEL_OPTIONS, {optional: true})
    private options: ChatModelOptions = {},
  ) {}

  /**
   * Value method to return the appropriate chat model instance
   */
  value(): BaseChatModel {
    const provider = this.options.provider ?? 'openai'
    const temperature = this.options.temperature ?? 0.7

    if (provider === 'anthropic') {
      const apiKey = this.options.apiKey ?? process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error(
          'Anthropic API key is required. Please provide it via options or set the ANTHROPIC_API_KEY environment variable.',
        )
      }

      // Default to Claude 3 Haiku model
      const modelName = this.options.model ?? 'claude-3-haiku-20240307'

      // Initialize Anthropic chat model
      return new ChatAnthropic({
        apiKey,
        modelName,
        temperature,
      })
    }
    // Default to OpenAI
    const apiKey = this.options.apiKey ?? process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Please provide it via options or set the OPENAI_API_KEY environment variable.',
      )
    }

    // Default to GPT-3.5 Turbo model
    const modelName = this.options.model ?? 'gpt-3.5-turbo'

    // Initialize OpenAI chat model
    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature,
    })
  }
}
