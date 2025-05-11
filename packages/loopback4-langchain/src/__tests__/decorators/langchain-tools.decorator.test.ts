import {expect} from '@loopback/testlab'
import {
  Application,
  BindingScope,
  Component,
  createBindingFromClass,
} from '@loopback/core'
import {z} from 'zod'
import {describe, it, beforeEach} from 'vitest'
import {langchainTools} from '../../decorators/langchain-tools.decorator'
import {Tool} from '../../types/tools.types'
import {ToolExtensionPointImpl} from '../../extension-points/langchain-tools.extension-point'
import {LangChainComponent} from '../../components/langchain.component'

describe('langchainTools decorator', () => {
  let app: Application

  beforeEach(async () => {
    app = new Application()
    app.component(LangChainComponent)
  })

  it('registers a class as a LangChain tool', async () => {
    @langchainTools()
    class TestTool implements Tool {
      name = 'test-tool'

      description = 'A test tool'

      schema = z
        .object({
          input: z.string().optional(),
        })
        .transform(input => input.input || '')

      async run(args: {input: string}): Promise<string> {
        return `Processed: ${args.input}`
      }
    }

    // Register the tool with the application
    app.add(createBindingFromClass(TestTool))

    // Create and bind the extension point manually
    const extensionPoint = new ToolExtensionPointImpl([new TestTool()])
    app.bind('langchain.tools').to(extensionPoint)

    // Get the extension point
    const retrievedExtensionPoint = await app.get<ToolExtensionPointImpl>(
      'langchain.tools',
    )

    // Verify that the tool is registered
    expect(retrievedExtensionPoint.tools).to.have.lengthOf(1)
    expect(retrievedExtensionPoint.tools[0].name).to.equal('test-tool')
    expect(retrievedExtensionPoint.tools[0].description).to.equal('A test tool')

    // Verify that getTools returns the correct LangChain tool
    const tools = retrievedExtensionPoint.getTools()
    expect(tools).to.have.lengthOf(1)
    expect(tools[0].name).to.equal('test-tool')
    expect(tools[0].description).to.equal('A test tool')
  })
})
