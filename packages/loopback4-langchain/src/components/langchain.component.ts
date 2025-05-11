import {Component, ProviderMap, inject} from '@loopback/core';
import {LangChainOptions, LangChainService} from '../services/langchain.service';
import {LANGCHAIN_OPTIONS, LANGCHAIN_SERVICE, REDIS_CHAT_MESSAGE_HISTORY} from '../keys';
import {LangChainServiceProvider} from '../providers/langchain.provider';
import {RedisChatMessageHistoryProvider} from '../providers/redis-chat-history.provider';
import {ToolExtensionPointImpl} from '../extension-points/langchain-tools.extension-point';
import {OutputParserExtensionPointImpl} from '../extension-points/langchain-output-parsers.extension-point';
import {LangChainBooter} from '../booter';
import {LangChainLifeCycleObserver} from '../observers/langchain.observer';

export class LangChainComponent implements Component {
  providers?: ProviderMap;
  services = [LangChainService, ToolExtensionPointImpl, OutputParserExtensionPointImpl, LangChainBooter, LangChainLifeCycleObserver];

  constructor(
    @inject(LANGCHAIN_OPTIONS, {optional: true})
    private options: LangChainOptions = {},
  ) {
    this.providers = {
      [LANGCHAIN_SERVICE.key]: LangChainServiceProvider,
      [REDIS_CHAT_MESSAGE_HISTORY.key]: RedisChatMessageHistoryProvider,
    };
  }
}
