import {BindingKey} from '@loopback/core'
import {RedisChatMessageHistory} from '@langchain/redis'
import {BaseOutputParser} from '@langchain/core/output_parsers'
import {BaseChatModel} from '@langchain/core/language_models/chat_models'
import {LangChainOptions, LangChainService} from './services/langchain.service'
import {RunnableLoader} from './runtime/runnable-loader'

/**
 * Namespace for LangChain binding keys
 */
export namespace LangChainBindings {
  /**
   * Binding key for LangChain service
   */
  export const LANGCHAIN_SERVICE = BindingKey.create<LangChainService>(
    'services.LangChainService',
  )

  /**
   * Binding key for LangChain service options
   */
  export const LANGCHAIN_OPTIONS = BindingKey.create<LangChainOptions>(
    'services.langchain.options',
  )

  /**
   * Binding key for LangChain configuration
   */
  export const CONFIG = BindingKey.create<Record<string, unknown>>(
    'services.langchain.config',
  )

  /**
   * Binding key for Redis Chat Message History
   */
  export const REDIS_CHAT_MESSAGE_HISTORY =
    BindingKey.create<RedisChatMessageHistory>(
      'services.RedisChatMessageHistory',
    )

  /**
   * Binding key for Output Parser
   */
  export const OUTPUT_PARSER = BindingKey.create<any>(
    'services.OutputParser',
  ) as BindingKey<BaseOutputParser>

  /**
   * Binding key for Chat Model
   */
  export const CHAT_MODEL = BindingKey.create<any>('services.ChatModel')

  /**
   * Binding key for Chat Model options
   */
  export const CHAT_MODEL_OPTIONS = BindingKey.create<Record<string, unknown>>(
    'services.chatmodel.options',
  )

  /**
   * Binding key for Runnable Loader
   */
  export const RUNNABLE_LOADER = BindingKey.create<RunnableLoader>(
    'services.RunnableLoader',
  )
}

// Export individual binding keys for backward compatibility
export const {LANGCHAIN_SERVICE} = LangChainBindings
export const {LANGCHAIN_OPTIONS} = LangChainBindings
export const {REDIS_CHAT_MESSAGE_HISTORY} = LangChainBindings
export const {OUTPUT_PARSER} = LangChainBindings
export const {CHAT_MODEL} = LangChainBindings
export const {CHAT_MODEL_OPTIONS} = LangChainBindings
export const {RUNNABLE_LOADER} = LangChainBindings
