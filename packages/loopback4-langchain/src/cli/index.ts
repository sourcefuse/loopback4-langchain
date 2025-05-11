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
    } else {
      this.log('Welcome to LoopBack 4 LangChain CLI!')
      this.log('Available commands:')
      this.log('  tool <name> - Generate a new tool')
      this.log('  prompt <name> [--system "..."] - Generate a new prompt')
      this.log('  system <name> --text="..." - Generate a new system instruction file')
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

  private async generatePrompt(name: string, systemPrompt?: string): Promise<void> {
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
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Tool'

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
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Prompt'
    const systemPromptSection = systemPrompt 
      ? `\n  /**
   * System prompt
   */
  systemPrompt = \`${systemPrompt}\`;` 
      : '';

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
${systemPrompt ? 'System: ' + systemPrompt + '\n\n' : ''}User: \${input}
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
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'System'
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
