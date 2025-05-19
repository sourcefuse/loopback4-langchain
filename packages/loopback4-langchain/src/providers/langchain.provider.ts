import {
  BindingScope,
  Provider,
  inject,
  injectable,
  service,
} from '@loopback/core'
import {LangChainService, LangChainOptions} from '../services/langchain.service'
import {LANGCHAIN_OPTIONS} from '../keys'
import {
  ToolExtensionPoint,
  ToolExtensionPointImpl,
} from '../extension-points/langchain-tools.extension-point'
import {
  OutputParserExtensionPoint,
  OutputParserExtensionPointImpl,
} from '../extension-points/langchain-output-parsers.extension-point'

@injectable({scope: BindingScope.SINGLETON})
export class LangChainServiceProvider implements Provider<LangChainService> {
  constructor(
    @service(ToolExtensionPointImpl)
    private readonly toolEP: ToolExtensionPoint,
    @service(OutputParserExtensionPointImpl)
    private readonly outputParserEP: OutputParserExtensionPoint,
    @inject(LANGCHAIN_OPTIONS, {optional: true})
    private options: LangChainOptions = {},
  ) {}

  value(): LangChainService {
    const llmTools = this.toolEP.getTools()
    const outputParsers = this.outputParserEP.getOutputParsers()
    return new LangChainService(this.options, llmTools, outputParsers)
  }
}
