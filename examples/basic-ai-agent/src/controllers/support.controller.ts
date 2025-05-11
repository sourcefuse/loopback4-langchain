import {inject} from '@loopback/core';
import {get, param, post, requestBody} from '@loopback/rest';
import {LangChainService} from 'loopback4-langchain';
import {SupportChain} from 'loopback4-langchain/dist/chains/support.chain';

/**
 * A controller that demonstrates how to use the SupportChain
 */
export class SupportController {
  constructor(
    @inject('services.LangChainService')
    private langchainService: LangChainService,
    @inject('langchain.chains.SupportChain')
    private supportChain: SupportChain,
  ) {}

  /**
   * Process a support request using the SupportChain
   */
  @post('/support')
  async processSupportRequest(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The customer support query',
              },
            },
            required: ['query'],
          },
        },
      },
    })
    request: {
      query: string;
    },
  ): Promise<object> {
    // Process the support request using the SupportChain
    const result = await this.supportChain.call({
      query: request.query,
    });

    return result;
  }

  /**
   * Get information about the SupportChain
   */
  @get('/support/info')
  async getSupportChainInfo(): Promise<object> {
    return {
      name: 'SupportChain',
      description: 'A chain that processes customer support requests and generates structured responses',
      inputKeys: this.supportChain.inputKeys,
      outputKeys: this.supportChain.outputKeys,
    };
  }

  /**
   * Process a support request with a specific query parameter
   */
  @get('/support/query')
  async processSupportQuery(
    @param.query.string('query') query: string,
  ): Promise<object> {
    // Process the support query using the SupportChain
    const result = await this.supportChain.call({
      query,
    });

    return result;
  }
}
