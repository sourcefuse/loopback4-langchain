import {BindingKey} from '@loopback/core';
import {LangChainOptions, LangChainService} from './services/langchain.service';
import {RedisChatMessageHistory} from '@langchain/redis';
import {BaseOutputParser} from '@langchain/core/output_parsers';

/**
 * Binding key for LangChain service
 */
export const LANGCHAIN_SERVICE =
  BindingKey.create<LangChainService>('services.LangChainService');

/**
 * Binding key for LangChain service options
 */
export const LANGCHAIN_OPTIONS = BindingKey.create<LangChainOptions>(
  'services.langchain.options',
);

/**
 * Binding key for Redis Chat Message History
 */
export const REDIS_CHAT_MESSAGE_HISTORY =
  BindingKey.create<RedisChatMessageHistory>('services.RedisChatMessageHistory');

/**
 * Binding key for Output Parser
 */
export const OUTPUT_PARSER =
  BindingKey.create<BaseOutputParser>('services.OutputParser');
