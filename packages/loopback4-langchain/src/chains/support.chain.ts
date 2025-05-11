import {inject} from '@loopback/core';
import {BaseChain} from 'langchain/chains';
import {BaseChatModel} from '@langchain/core/language_models/chat_models';
import {ChainValues} from '@langchain/core/utils/types';
import {StructuredOutputParser} from '@langchain/core/output_parsers';
import {z} from 'zod';

// Define the schema for support responses
const supportResponseSchema = z.object({
  category: z.string().describe('The category of the support request (e.g., technical, billing, feature)'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).describe('The priority level of the request'),
  summary: z.string().describe('A brief summary of the customer\'s issue'),
  response: z.string().describe('A helpful response to the customer'),
  nextSteps: z.array(z.string()).describe('Suggested next steps or actions'),
});

/**
 * A support chain that handles customer support requests.
 * 
 * This chain processes support requests and generates structured responses
 * with categorization, priority, and suggested actions.
 */
export class SupportChain extends BaseChain {
  private outputParser: StructuredOutputParser<any>;

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

    // Create a structured output parser for support responses
    this.outputParser = StructuredOutputParser.fromZodSchema(supportResponseSchema);
  }

  /**
   * Get the input keys required by this chain
   */
  get inputKeys(): string[] {
    return ['query'];
  }

  /**
   * Get the output keys produced by this chain
   */
  get outputKeys(): string[] {
    return ['result'];
  }

  /**
   * Run the chain with the provided input
   * 
   * @param values - The input values for the chain
   * @returns A promise that resolves to the output values
   */
  async _call(values: ChainValues): Promise<ChainValues> {
    const query = values.query as string;
    const template = this.options.template || 
      `You are a helpful customer support assistant. Analyze the following customer query and provide a structured response.

      Customer Query: {query}

      ${this.outputParser.getFormatInstructions()}`;

    const formattedTemplate = template.replace('{query}', query);

    const response = await this.chatModel.invoke(formattedTemplate);
    // Convert MessageContent to string if needed
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    const parsedResponse = await this.outputParser.parse(content);

    return {
      result: parsedResponse,
    };
  }

  /**
   * Return a string representation of this chain
   */
  _chainType(): string {
    return 'support_chain';
  }
}
