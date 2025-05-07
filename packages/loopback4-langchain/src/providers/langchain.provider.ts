import {Provider, inject, service} from '@loopback/core';
import {
  LangChainService,
  LangChainOptions,
} from '../services/langchain.service';
import {LANGCHAIN_OPTIONS} from '../keys';
import {
  ToolExtensionPoint,
  ToolExtensionPointImpl,
} from '../extension-points/langchain-tools.extension-point';

export class LangChainServiceProvider implements Provider<LangChainService> {
  private static instance: LangChainService;

  constructor(
    @inject(LANGCHAIN_OPTIONS, {optional: true})
    private options: LangChainOptions = {},
    @service(ToolExtensionPointImpl)
    private readonly toolEP: ToolExtensionPoint,
  ) {}

  value(): LangChainService {
    if (!LangChainServiceProvider.instance) {
      const llmTools = this.toolEP.getTools();
      LangChainServiceProvider.instance = new LangChainService(
        this.options,
        llmTools,
      );
    }
    return LangChainServiceProvider.instance;
  }
}
