import {inject} from '@loopback/core';
import {get, param, post, requestBody} from '@loopback/rest';
import {LangChainService} from 'loopback4-langchain';
import {CalculatorTool} from '../tools';
import {StructuredOutputParser} from '@langchain/core/output_parsers';
import {z} from 'zod';

/**
 * A controller that demonstrates how to use LangChain tools and output parsers
 */
export class ToolsExampleController {
  constructor(
    @inject('services.LangChainService')
    private langchainService: LangChainService,
    @inject('tools.CalculatorTool')
    private calculatorTool: CalculatorTool,
  ) {}

  /**
   * Execute the calculator tool directly
   */
  @post('/tools/calculator')
  async executeCalculator(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                enum: ['add', 'subtract', 'multiply', 'divide'],
              },
              a: {type: 'number'},
              b: {type: 'number'},
            },
            required: ['operation', 'a', 'b'],
          },
        },
      },
    })
    args: {operation: string; a: number; b: number},
  ): Promise<{result: string}> {
    // Format the args object as a string in the format expected by the calculator tool
    const inputStr = `operation: ${args.operation}, a: ${args.a}, b: ${args.b}`;
    const result = await this.calculatorTool.run(inputStr);
    return {result};
  }

  /**
   * Generate a response using the LLM with the calculator tool
   */
  @get('/tools/generate')
  async generateWithTools(
    @param.query.string('prompt') prompt: string,
  ): Promise<{response: string}> {
    const response = await this.langchainService.generateText(prompt);
    return {response};
  }

  /**
   * Parse the output of the LLM response using a structured output parser
   */
  @post('/tools/parse')
  async parseOutput(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              prompt: {type: 'string'},
            },
            required: ['prompt'],
          },
        },
      },
    })
    args: {prompt: string},
  ): Promise<{parsed: unknown}> {
    // Create a structured output parser
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        operation: z.string().describe('The mathematical operation performed'),
        numbers: z.array(z.number()).describe('The numbers used in the calculation'),
        result: z.number().describe('The result of the calculation'),
        explanation: z.string().describe('A brief explanation of the calculation'),
      })
    );

    // Format the prompt with the parser instructions
    const formatInstructions = parser.getFormatInstructions();
    const fullPrompt = `
      ${args.prompt}

      ${formatInstructions}
    `;

    // Generate text and parse the output
    const response = await this.langchainService.generateText(fullPrompt);
    const parsed = await parser.parse(response);

    return {parsed};
  }

  /**
   * Get information about the available tools
   */
  @get('/tools/info')
  async getToolsInfo(): Promise<{tools: object[]}> {
    // Return information about the calculator tool
    return {
      tools: [
        {
          name: this.calculatorTool.name,
          description: this.calculatorTool.description,
          schema: this.calculatorTool.schema,
        },
      ],
    };
  }
}
