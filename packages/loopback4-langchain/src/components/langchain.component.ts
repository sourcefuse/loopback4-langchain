import {Component, ProviderMap} from '@loopback/core'
import {
  LANGCHAIN_SERVICE,
  REDIS_CHAT_MESSAGE_HISTORY,
  RUNNABLE_LOADER,
} from '../keys'
import {LangChainServiceProvider} from '../providers/langchain.provider'
import {RedisChatMessageHistoryProvider} from '../providers/redis-chat-history.provider'
import {ToolExtensionPointImpl} from '../extension-points/langchain-tools.extension-point'
import {OutputParserExtensionPointImpl} from '../extension-points/langchain-output-parsers.extension-point'
import {LangChainBooter} from '../booter'
import {LangChainLifeCycleObserver} from '../observers/langchain.observer'
import { RunnableLoaderProvider } from '../runtime/runnable-loader-provider'

export class LangChainComponent implements Component {
  providers?: ProviderMap

  services = [
    ToolExtensionPointImpl,
    OutputParserExtensionPointImpl,
    LangChainBooter,
    LangChainLifeCycleObserver,
  ]

  constructor() {
    this.providers = {
      [LANGCHAIN_SERVICE.key]: LangChainServiceProvider,
      [REDIS_CHAT_MESSAGE_HISTORY.key]: RedisChatMessageHistoryProvider,
      [RUNNABLE_LOADER.key]: RunnableLoaderProvider,
    }
  }
}
