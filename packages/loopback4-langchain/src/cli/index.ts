#!/usr/bin/env node

import {Command, Flags, Args} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

class LB4LCCommand extends Command {
  static description = 'LoopBack 4 LangChain CLI'

  static flags = {
    system: Flags.string({
      description: 'System prompt for prompt command',
      required: false,
    }),
    text: Flags.string({
      description: 'Text content for system command',
      required: false,
    }),
    datasource: Flags.string({
      description: 'Datasource for retriever command',
      required: false,
      char: 'd',
    }),
    type: Flags.string({
      description: 'Type of runnable (llm, chat_model, tool, chain, retriever)',
      required: false,
      options: ['llm', 'chat_model', 'tool', 'chain', 'retriever'],
      default: 'chain',
    }),
    from: Flags.string({
      description: 'Runnable name to use as source for chain command',
      required: false,
    }),
  }

  static args = {
    command: Args.string({
      description: 'Command to run',
      required: true,
    }),
    name: Args.string({
      description: 'Name of the resource',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(LB4LCCommand)

    if (args.command === 'tool' && args.name) {
      await this.generateTool(args.name)
    } else if (args.command === 'prompt' && args.name) {
      await this.generatePrompt(args.name, flags.system)
    } else if (args.command === 'system' && args.name) {
      await this.generateSystem(args.name, flags.text)
    } else if (args.command === 'retriever' && args.name) {
      await this.generateRetriever(args.name, flags.datasource)
    } else if (args.command === 'runnable' && args.name) {
      await this.generateRunnable(args.name, flags.type)
    } else if (args.command === 'chain' && args.name) {
      await this.generateChain(args.name, flags.from)
    } else {
      this.log('Welcome to LoopBack 4 LangChain CLI!')
      this.log('Available commands:')
      this.log('  tool <name> - Generate a new tool')
      this.log('  prompt <name> [--system "..."] - Generate a new prompt')
      this.log(
        '  system <name> --text="..." - Generate a new system instruction file',
      )
      this.log(
        '  retriever <name> --datasource <DS> - Generate a new retriever',
      )
      this.log(
        '  runnable <name> [--type <type>] - Generate a new runnable JSON stub',
      )
      this.log('  chain <name> [--from <runnableName>] - Generate a new chain')
    }
  }

  private async generateTool(name: string): Promise<void> {
    // Ensure the tools directory exists
    const toolsDir = path.join(process.cwd(), 'tools')
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir, {recursive: true})
    }

    const fileName = `${name}.tool.ts`
    const filePath = path.join(toolsDir, fileName)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      this.error(`Tool file ${fileName} already exists in ${toolsDir}`)
      return
    }

    // Create the tool file content
    const content = this.getToolTemplate(name)

    // Write the file
    fs.writeFileSync(filePath, content)
    this.log(`Created tool file: ${filePath}`)
  }

  private async generatePrompt(
    name: string,
    systemPrompt?: string,
  ): Promise<void> {
    // Ensure the prompts directory exists
    const promptsDir = path.join(process.cwd(), 'prompts')
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, {recursive: true})
    }

    const fileName = `${name}.prompt.ts`
    const filePath = path.join(promptsDir, fileName)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      this.error(`Prompt file ${fileName} already exists in ${promptsDir}`)
      return
    }

    // Create the prompt file content
    const content = this.getPromptTemplate(name, systemPrompt)

    // Write the file
    fs.writeFileSync(filePath, content)
    this.log(`Created prompt file: ${filePath}`)
  }

  private getToolTemplate(name: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Tool`

    return `import {langchainTools, Tool} from 'loopback4-langchain';
import {z} from 'zod';

/**
 * ${className} - Add your tool description here
 */
@langchainTools()
export class ${className} implements Tool {
  name = '${name.toLowerCase()}';
  description = 'Description of what this tool does';
  schema = z.object({
    input: z.string().optional(),
  }).transform(input => input.input || "");

  async run(input: string): Promise<string> {
    try {
      // Implement your tool logic here
      return \`${name} tool received: \${input}\`;
    } catch (error) {
      return \`Error in ${name} tool: \${error instanceof Error ? error.message : String(error)}\`;
    }
  }
}
`
  }

  private getPromptTemplate(name: string, systemPrompt?: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Prompt`
    const systemPromptSection = systemPrompt
      ? `\n  /**
   * System prompt
   */
  systemPrompt = \`${systemPrompt}\`;`
      : ''

    return `/**
 * A prompt template for ${name}-related queries
 */
export class ${className} {
  /**
   * Name of the prompt
   */
  name = '${name.toLowerCase()}';

  /**
   * Description of the prompt
   */
  description = 'A prompt template for ${name}-related queries';${systemPromptSection}

  /**
   * Generate a basic prompt
   * @param input The input for the prompt
   * @returns A formatted prompt string
   */
  generatePrompt(input: string): string {
    return \`
${systemPrompt ? `System: ${systemPrompt}\n\n` : ''}User: \${input}
\`.trim();
  }
}
`
  }

  private async generateSystem(name: string, text?: string): Promise<void> {
    // Ensure the systems directory exists
    const systemsDir = path.join(process.cwd(), 'systems')
    if (!fs.existsSync(systemsDir)) {
      fs.mkdirSync(systemsDir, {recursive: true})
    }

    const fileName = `${name}.system.ts`
    const filePath = path.join(systemsDir, fileName)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      this.error(`System file ${fileName} already exists in ${systemsDir}`)
      return
    }

    // Create the system file content
    const content = this.getSystemTemplate(name, text)

    // Write the file
    fs.writeFileSync(filePath, content)
    this.log(`Created system instruction file: ${filePath}`)
  }

  private getSystemTemplate(name: string, text?: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}System`
    const systemText = text || 'You are a helpful assistant.'

    return `/**
 * System instruction for ${name}
 */
export class ${className} {
  /**
   * Name of the system instruction
   */
  name = '${name.toLowerCase()}';

  /**
   * Description of the system instruction
   */
  description = 'System instruction for ${name}';

  /**
   * The system instruction text
   */
  text = \`${systemText}\`;

  /**
   * Get the system instruction text
   * @returns The system instruction text
   */
  getText(): string {
    return this.text;
  }
}
`
  }

  private async generateRetriever(
    name: string,
    datasource?: string,
  ): Promise<void> {
    // Ensure the retrievers directory exists
    const retrieversDir = path.join(process.cwd(), 'retrievers')
    if (!fs.existsSync(retrieversDir)) {
      fs.mkdirSync(retrieversDir, {recursive: true})
    }

    const fileName = `${name}.retriever.ts`
    const filePath = path.join(retrieversDir, fileName)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      this.error(
        `Retriever file ${fileName} already exists in ${retrieversDir}`,
      )
      return
    }

    // Create the retriever file content
    const content = this.getRetrieverTemplate(name, datasource)

    // Write the file
    fs.writeFileSync(filePath, content)
    this.log(`Created retriever file: ${filePath}`)
  }

  private async generateRunnable(
    name: string,
    type: string = 'chain',
  ): Promise<void> {
    // Ensure the configs/runnables directory exists
    const runnablesDir = path.join(process.cwd(), 'configs', 'runnables')
    if (!fs.existsSync(runnablesDir)) {
      fs.mkdirSync(runnablesDir, {recursive: true})
    }

    const fileName = `${name}.json`
    const filePath = path.join(runnablesDir, fileName)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      this.error(`Runnable file ${fileName} already exists in ${runnablesDir}`)
      return
    }

    // Create the runnable file content
    const content = this.getRunnableTemplate(name, type)

    // Write the file
    fs.writeFileSync(filePath, content)
    this.log(`Created runnable JSON stub: ${filePath}`)
  }

  private getRunnableTemplate(name: string, type: string): string {
    const id = `${name.toLowerCase()}`
    const displayName = name.charAt(0).toUpperCase() + name.slice(1)

    const template: any = {
      type,
      id,
      name: displayName,
      description: `${displayName} runnable`,
      metadata: {},
      lc: {
        type: `langchain.${type}s.base.Base${
          type.charAt(0).toUpperCase() + type.slice(1)
        }`,
        id: [
          'langchain',
          `${type}s`,
          'base',
          `Base${type.charAt(0).toUpperCase() + type.slice(1)}`,
        ],
      },
    }

    // Add type-specific configuration
    switch (type) {
      case 'llm':
      case 'chat_model':
        template.config = {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 100,
        }
        break
      case 'tool':
        template.config = {
          schema: {
            type: 'object',
            properties: {
              query: {type: 'string'},
            },
            required: ['query'],
          },
          func: `${id}Function`,
        }
        break
      case 'chain':
        template.config = {
          steps: [
            {
              id: 'step1',
              type: 'llm',
            },
            {
              id: 'step2',
              type: 'tool',
            },
          ],
        }
        break
      case 'retriever':
        template.config = {
          search_type: 'similarity',
          search_kwargs: {
            k: 5,
          },
        }
        break
    }

    return JSON.stringify(template, null, 2)
  }

  private async generateChain(
    name: string,
    runnableName?: string,
  ): Promise<void> {
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

    if (runnableName) {
      return `import {inject} from '@loopback/core';
import {BaseChain} from 'langchain/chains';
import {ChainValues} from '@langchain/core/utils/types';
import {RunnableLoader} from 'loopback4-langchain';

/**
 * ${className} - A chain that uses the ${runnableName} runnable
 */
export class ${className} extends BaseChain {
  /**
   * Constructor with dependency injection
   * 
   * @param runnableLoader - The runnable loader to use for loading the ${runnableName} runnable
   * @param options - Optional configuration options for the chain
   */
  constructor(
    @inject('services.RunnableLoader')
    private runnableLoader: RunnableLoader,
    private options: {
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

    // Load the runnable
    const runnable = await this.runnableLoader.load({
      id: '${runnableName}',
    });

    // Invoke the runnable
    const result = await runnable.invoke(input);

    return {
      output: result,
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
    return `import {inject} from '@loopback/core';
import {BaseChain} from 'langchain/chains';
import {BaseChatModel} from '@langchain/core/language_models/chat_models';
import {ChainValues} from '@langchain/core/utils/types';

/**
 * ${className} - A custom chain for ${name}
 */
export class ${className} extends BaseChain {
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

  private getRetrieverTemplate(name: string, datasource?: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Retriever`
    const dsName = datasource || 'DefaultDataSource'

    return `import { inject } from '@loopback/core';
import { Document } from '@langchain/core/documents';
import { BaseVectorRetriever } from 'loopback4-langchain';
import { ${dsName} } from '../datasources';
import { DefaultCrudRepository } from '@loopback/repository';
import { YourEntity } from '../models'; // Replace with your actual entity

/**
 * ${className} - A vector retriever for ${name}
 */
export class ${className} extends BaseVectorRetriever<YourEntity, typeof YourEntity.prototype.id> {
  /**
   * Constructor
   * @param repository - The repository to use for vector search
   */
  constructor(
    @inject('repositories.YourRepository') // Replace with your actual repository
    repository: DefaultCrudRepository<YourEntity, typeof YourEntity.prototype.id, {}>,
  ) {
    super(repository);
  }

  /**
   * Get relevant documents for a query
   * @param query - The query string
   * @returns A promise that resolves to an array of Document objects
   */
  async getRelevantDocuments(query: string): Promise<Document[]> {
    const entities = await this.vectorSearch(query);
    return entities.map(entity => this.entityToDocument(entity));
  }

  /**
   * Convert an entity to a Document
   * @param entity - The entity to convert
   * @returns A Document object
   */
  protected entityToDocument(entity: YourEntity): Document {
    return new Document({
      pageContent: entity.content || '', // Replace with your actual content field
      metadata: {
        id: entity.id,
        // Add other metadata fields as needed
      },
    });
  }

  /**
   * Perform a vector search on the repository
   * @param query - The query vector or string
   * @param options - Options for the vector search
   * @returns A promise that resolves to an array of entities
   */
  protected async vectorSearch(
    query: number[] | string,
    options?: {
      k?: number;
      filter?: object;
      [key: string]: unknown;
    }
  ): Promise<YourEntity[]> {
    // Implement your vector search logic here
    // This is a placeholder implementation
    const k = options?.k ?? 4;

    // Replace this with your actual vector search implementation
    // For example, if your repository has a vectorSearch method:
    // return (this.repository as any).vectorSearch(query, k, options?.filter);

    // Placeholder implementation
    return this.repository.find({ limit: k });
  }
}
`
  }
}

// This is needed for oclif to properly handle the command
module.exports = LB4LCCommand

// This is needed to run the CLI when the file is executed directly
if (require.main === module) {
  const {run} = require('@oclif/core')
  run().catch((err: Error) => {
    console.error(err)
    process.exit(1)
  })
}
