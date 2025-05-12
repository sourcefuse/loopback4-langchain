import {Command, Args} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class ToolCommand extends Command {
  static description = 'Generate a new LangChain tool'

  static examples = [
    '$ lb4lc tool my-tool',
  ]

  static args = {
    name: Args.string({
      description: 'Name of the tool',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(ToolCommand)
    await this.generateTool(args.name)
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

  private getToolTemplate(name: string): string {
    const className = `${name.charAt(0).toUpperCase() + name.slice(1)}Tool`
    
    return `import { DynamicTool } from '@langchain/core/tools';

/**
 * ${className} - A custom tool for ${name}
 */
export const ${className} = new DynamicTool({
  name: '${name}',
  description: 'Tool for ${name}. Replace this with a proper description.',
  func: async (input: string) => {
    // Implement your tool logic here
    console.log(\`${name} tool called with input: \${input}\`);
    
    // Return the result
    return \`Processed input: \${input}\`;
  },
});
`
  }
}