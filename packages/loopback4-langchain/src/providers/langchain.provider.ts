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
import {
  OutputParserExtensionPoint,
  OutputParserExtensionPointImpl,
} from '../extension-points/langchain-output-parsers.extension-point';

export class LangChainServiceProvider implements Provider<LangChainService> {
  private static instance: LangChainService;

  constructor(
    @inject(LANGCHAIN_OPTIONS, {optional: true})
    private options: LangChainOptions = {},
    @service(ToolExtensionPointImpl)
    private readonly toolEP: ToolExtensionPoint,
    @service(OutputParserExtensionPointImpl)
    private readonly outputParserEP: OutputParserExtensionPoint,
  ) {}

  value(): LangChainService {
    if (!LangChainServiceProvider.instance) {
      const llmTools = this.toolEP.getTools();
      const outputParsers = this.outputParserEP.getOutputParsers();
      LangChainServiceProvider.instance = new LangChainService(
        this.options,
        llmTools,
        outputParsers,
      );
    }
    return LangChainServiceProvider.instance;
  }
}
