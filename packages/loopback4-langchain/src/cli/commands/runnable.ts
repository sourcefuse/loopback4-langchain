import {Command, Args, Flags} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class RunnableCommand extends Command {
  static description = 'Generate a new runnable JSON stub'

  static examples = [
    '$ lb4lc runnable my-runnable',
    '$ lb4lc runnable my-runnable --type llm',
    '$ lb4lc runnable my-runnable --type chat_model',
    '$ lb4lc runnable my-runnable --type tool',
    '$ lb4lc runnable my-runnable --type chain',
    '$ lb4lc runnable my-runnable --type retriever',
  ]

  static args = {
    name: Args.string({
      description: 'Name of the runnable',
      required: true,
    }),
  }

  static flags = {
    type: Flags.string({
      description: 'Type of runnable',
      required: false,
      options: ['llm', 'chat_model', 'tool', 'chain', 'retriever'],
      default: 'chain',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(RunnableCommand)
    await this.generateRunnable(args.name, flags.type)
  }

  private generateRunnable(name: string, type: string): void {
    // Ensure the runnables directory exists
    const runnablesDir = path.join(process.cwd(), 'runnables')
    if (!fs.existsSync(runnablesDir)) {
      fs.mkdirSync(runnablesDir, {recursive: true})
    }

    const fileName = `${name}.runnable.ts`
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
    this.log(`Created runnable file: ${filePath}`)
  }

  private getRunnableTemplate(name: string, type: string): string {
    const constName = `${name.charAt(0).toUpperCase() + name.slice(1)}Runnable`

    let template = ''

    switch (type) {
      case 'llm':
        template = `import { RunnableConfig } from '@langchain/core/runnables';

/**
 * ${constName} - A runnable configuration for an LLM
 */
export const ${constName}: RunnableConfig = {
  metadata: {
    name: '${name}',
    description: 'LLM configuration for ${name}',
  },
  recursionLimit: 25,
  tags: ['llm', '${name}'],
};
`
        break
      case 'chat_model':
        template = `import { RunnableConfig } from '@langchain/core/runnables';

/**
 * ${constName} - A runnable configuration for a chat model
 */
export const ${constName}: RunnableConfig = {
  metadata: {
    name: '${name}',
    description: 'Chat model configuration for ${name}',
  },
  recursionLimit: 25,
  tags: ['chat_model', '${name}'],
};
`
        break
      case 'tool':
        template = `import { RunnableConfig } from '@langchain/core/runnables';

/**
 * ${constName} - A runnable configuration for a tool
 */
export const ${constName}: RunnableConfig = {
  metadata: {
    name: '${name}',
    description: 'Tool configuration for ${name}',
  },
  recursionLimit: 25,
  tags: ['tool', '${name}'],
};
`
        break
      case 'retriever':
        template = `import { RunnableConfig } from '@langchain/core/runnables';

/**
 * ${constName} - A runnable configuration for a retriever
 */
export const ${constName}: RunnableConfig = {
  metadata: {
    name: '${name}',
    description: 'Retriever configuration for ${name}',
  },
  recursionLimit: 25,
  tags: ['retriever', '${name}'],
};
`
        break
      case 'chain':
      default:
        template = `import { RunnableConfig } from '@langchain/core/runnables';

/**
 * ${constName} - A runnable configuration for a chain
 */
export const ${constName}: RunnableConfig = {
  metadata: {
    name: '${name}',
    description: 'Chain configuration for ${name}',
  },
  recursionLimit: 25,
  tags: ['chain', '${name}'],
};
`
        break
    }

    return template
  }
}
