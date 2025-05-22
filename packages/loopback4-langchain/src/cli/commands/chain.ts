import {Command, Args, Flags} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class ChainCommand extends Command {
  static description = 'Generate a new chain'

  static examples = [
    '$ lb4lc chain my-chain',
    '$ lb4lc chain my-chain --from my-runnable',
  ]

  static args = {
    name: Args.string({
      description: 'Name of the chain',
      required: true,
    }),
  }

  static flags = {
    from: Flags.string({
      description: 'Runnable name to use as source',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ChainCommand)
    await this.generateChain(args.name, flags.from)
  }

  private generateChain(name: string, runnableName?: string): void {
    // Ensure the chains directory exists
    const chainsDir = path.join(process.cwd(), 'chains')
    if (!fs.existsSync(chainsDir)) {
      fs.mkdirSync(chainsDir, {recursive: true})
    }

    const fileName = `${name}.chain.ts`
    const filePath = path.join(chainsDir, fileName)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      this.error(`Chain file ${fileName} already exists in ${chainsDir}`)
      return
    }

    // Create the chain file content
    const content = this.getChainTemplate(name, runnableName)

    // Write the file
    fs.writeFileSync(filePath, content)
    this.log(`Created chain file: ${filePath}`)
  }

  private getChainTemplate(name: string, runnableName?: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Chain`
    const runnableImport = runnableName
      ? `import { ${
          runnableName.charAt(0).toUpperCase() + runnableName.slice(1)
        }Runnable } from '../runnables/${runnableName}.runnable';`
      : ''
    const runnableConfig = runnableName
      ? `\n  /**
   * The runnable configuration for this chain
   */
  static runnableConfig = ${
    runnableName.charAt(0).toUpperCase() + runnableName.slice(1)
  }Runnable;`
      : ''

    return `import { BaseChain, ChainInputs } from 'langchain/chains';
import { ChatGroq } from '@langchain/groq';
import { ChainValues } from 'langchain/schema';
${runnableImport}

/**
 * Options for the ${className}
 */
export interface ${className}Options extends ChainInputs {
  /**
   * The chat model to use
   */
  chatModel: ChatGroq;

  /**
   * The template to use for formatting the input
   */
  template?: string;
}

/**
 * ${className} - A custom chain for ${name}
 */
export class ${className} extends BaseChain {
  chatModel: ChatGroq;
  options: ${className}Options;${runnableConfig}

  /**
   * Constructor
   * @param options - The options for this chain
   */
  constructor(options: ${className}Options) {
    super(options);
    this.chatModel = options.chatModel;
    this.options = options;
  }

  /**
   * Get the input keys for this chain
   * @returns An array of input keys
   */
  get inputKeys(): string[] {
    return ['input'];
  }

  /**
   * Get the output keys for this chain
   * @returns An array of output keys
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
    const template = this.options.template || 'Input: {input}\\nOutput:';

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
    return '${name.toLowerCase()}_chain';
  }
}
`
  }
}
