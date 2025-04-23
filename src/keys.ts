import {BindingKey} from '@loopback/core';
import {LangChainOptions, LangChainService} from './services/langchain.service';

/**
 * Binding key for LangChain service
 */
export const LANGCHAIN_SERVICE =
  BindingKey.create<LangChainService>('services.langchain');

/**
 * Binding key for LangChain service options
 */
export const LANGCHAIN_OPTIONS = BindingKey.create<LangChainOptions>(
  'services.langchain.options',
);
