import {Command, Args, Flags} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class PromptCommand extends Command {
  static description = 'Generate a new prompt template'

  static examples = [
    '$ lb4lc prompt my-prompt',
    '$ lb4lc prompt my-prompt --system "You are a helpful assistant"',
  ]

  static args = {
    name: Args.string({
      description: 'Name of the prompt',
      required: true,
    }),
  }

  static flags = {
    system: Flags.string({
      description: 'System prompt content',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(PromptCommand)
    await this.generatePrompt(args.name, flags.system)
  }

  private generatePrompt(name: string, systemPrompt?: string): void {
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

  private getPromptTemplate(name: string, systemPrompt?: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Prompt`
    const defaultSystemPrompt = systemPrompt || 'You are a helpful assistant.'

    return `import { ChatPromptTemplate } from '@langchain/core/prompts';

/**
 * ${className} - A prompt template for ${name}
 */
export const ${className} = ChatPromptTemplate.fromMessages([
  ['system', \`${defaultSystemPrompt}\`],
  ['human', '{input}'],
]);
`
  }
}
