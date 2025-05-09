import {expect} from '@loopback/testlab';
import {Application, Component, createBindingFromClass} from '@loopback/core';
import {langchainTools} from '../../decorators/langchain-tools.decorator';
import {Tool} from '../../types/tools.types';
import {ToolExtensionPointImpl} from '../../extension-points/langchain-tools.extension-point';
import {LangChainComponent} from '../../components/langchain.component';
import {z} from 'zod';

describe('langchainTools decorator', () => {
  let app: Application;

  beforeEach(() => {
    app = new Application();
    app.component(LangChainComponent);
  });

  it('registers a class as a LangChain tool', async () => {
    @langchainTools()
    class TestTool implements Tool {
      name = 'test-tool';
      description = 'A test tool';
      schema = z.object({
        input: z.string().optional(),
      }).transform(input => input.input || "");

      async run(args: {input: string}): Promise<string> {
        return `Processed: ${args.input}`;
      }
    }

    // Register the tool with the application
    app.add(createBindingFromClass(TestTool));

    // Get the extension point
    const extensionPoint = await app.get<ToolExtensionPointImpl>(
      'langchain.ToolExtensionPoint',
    );

    // Verify that the tool is registered
    expect(extensionPoint.tools).to.have.lengthOf(1);
    expect(extensionPoint.tools[0].name).to.equal('test-tool');
    expect(extensionPoint.tools[0].description).to.equal('A test tool');

    // Verify that getTools returns the correct LangChain tool
    const tools = extensionPoint.getTools();
    expect(tools).to.have.lengthOf(1);
    expect(tools[0].name).to.equal('test-tool');
    expect(tools[0].description).to.equal('A test tool');
  });
});
