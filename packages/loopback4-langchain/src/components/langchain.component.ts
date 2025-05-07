import {Component, ProviderMap, inject} from '@loopback/core';
import {LangChainOptions} from '../services/langchain.service';
import {LANGCHAIN_OPTIONS} from '../keys';
import {LangChainServiceProvider} from '../providers/langchain.provider';
import {ToolExtensionPointImpl} from '../extension-points/langchain-tools.extension-point';

export class LangChainComponent implements Component {
  providers?: ProviderMap;
  services = [ToolExtensionPointImpl];

  constructor(
    @inject(LANGCHAIN_OPTIONS, {optional: true})
    private options: LangChainOptions = {},
  ) {
    this.providers = {
      [LangChainServiceProvider.name]: LangChainServiceProvider,
    };
  }
}
