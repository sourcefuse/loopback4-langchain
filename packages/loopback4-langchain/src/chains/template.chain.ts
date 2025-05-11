import {inject} from '@loopback/core';
import {BaseChain} from 'langchain/chains';
import {BaseChatModel} from '@langchain/core/language_models/chat_models';
import {ChainValues} from '@langchain/core/utils/types';

/**
 * A template chain class that demonstrates constructor injection.
 * 
 * This class can be used as a starting point for creating custom chains
 * in a LoopBack 4 application with LangChain integration.
 */
export class TemplateChain extends BaseChain {
  /**
   * Constructor with dependency injection
   * 
   * @param chatModel - The chat model to use for generating responses
   * @param options - Optional configuration options for the chain
   */
  constructor(
    @inject('langchain.chat_model')
    private chatModel: BaseChatModel,
    private options: {
      template?: string;
      verbose?: boolean;
    } = {},
  ) {
    super(options);
  }

  /**
   * Get the input keys required by this chain
   */
  get inputKeys(): string[] {
    return ['input'];
  }

  /**
   * Get the output keys produced by this chain
   */
  get outputKeys(): string[] {
    return ['output'];
  }

  /**
   * Run the chain with the provided input
   * 
   * @param values - The input values for the chain
   * @returns A promise that resolves to the output values
   */
  async _call(values: ChainValues): Promise<ChainValues> {
    const input = values.input as string;
    const template = this.options.template || 'Input: {input}\nOutput:';

    const formattedTemplate = template.replace('{input}', input);

    const response = await this.chatModel.invoke(formattedTemplate);

    return {
      output: response.content,
    };
  }

  /**
   * Return a string representation of this chain
   */
  _chainType(): string {
    return 'template_chain';
  }
}
