import {Provider, inject} from '@loopback/core';
import {LangChainService, LangChainOptions} from '../services/langchain.service';
import {LANGCHAIN_OPTIONS} from '../keys';

export class LangChainServiceProvider implements Provider<LangChainService> {
  private static instance: LangChainService;

  constructor(
    @inject(LANGCHAIN_OPTIONS, {optional: true})
    private options: LangChainOptions = {},
  ) {}

  value(): LangChainService {
    if (!LangChainServiceProvider.instance) {
      LangChainServiceProvider.instance = new LangChainService(this.options);
    }
    return LangChainServiceProvider.instance;
  }
}