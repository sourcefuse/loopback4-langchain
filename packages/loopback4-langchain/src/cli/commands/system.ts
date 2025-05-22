import {Command, Args, Flags} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class SystemCommand extends Command {
  static description = 'Generate a new system instruction file'

  static examples = [
    '$ lb4lc system my-system --text="You are a helpful assistant"',
  ]

  static args = {
    name: Args.string({
      description: 'Name of the system instruction',
      required: true,
    }),
  }

  static flags = {
    text: Flags.string({
      description: 'Text content for the system instruction',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(SystemCommand)
    await this.generateSystem(args.name, flags.text)
  }

  private generateSystem(name: string, text: string): void {
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
    this.log(`Created system file: ${filePath}`)
  }

  private getSystemTemplate(name: string, text: string): string {
    const constName = `${
      name.charAt(0).toUpperCase() + name.slice(1)
    }SystemInstruction`

    return `/**
 * ${constName} - A system instruction for ${name}
 */
export const ${constName} = \`${text}\`;
`
  }
}
