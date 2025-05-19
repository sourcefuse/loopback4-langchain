import {expect} from '@loopback/testlab'
import {Application, BindingScope} from '@loopback/core'
import {BootBindings} from '@loopback/boot'
import path from 'path'
import fs from 'fs'
import {z} from 'zod'
import {describe, it, beforeEach, afterEach} from 'vitest'
import {ToolImpl} from '../types/tools.types'
import {LangChainBooter} from '../booter'
import {FaqRetriever} from '../retrievers/faq-retriever'
import {RUNNABLE_LOADER} from '../keys'
import {RunnableLoader} from '../runtime/runnable-loader'

describe('LangChainBooter', () => {
  let app: Application
  let booter: LangChainBooter
  const fixturesDir = path.resolve(__dirname, './fixtures')
  const toolsDir = path.join(fixturesDir, 'tools')
  const retrieversDir = path.join(fixturesDir, 'retrievers')
  const runnablesDir = fixturesDir // Runnables are discovered from the root directory

  beforeEach(() => {
    // Create fixtures directory if it doesn't exist
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir)
    }

    // Create tools directory if it doesn't exist
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir)
    }

    // Create retrievers directory if it doesn't exist
    if (!fs.existsSync(retrieversDir)) {
      fs.mkdirSync(retrieversDir)
    }

    // Create a SearchTool file in the fixtures directory
    const searchToolPath = path.join(toolsDir, 'search.tool.js')
    const searchToolContent = `
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SearchTool = void 0;

      class SearchTool {
        constructor() {
          this.name = 'search';
          this.description = 'Search for information';
        }

        async run(query) {
          return "Searched for: " + query;
        }
      }
      exports.SearchTool = SearchTool;
    `
    fs.writeFileSync(searchToolPath, searchToolContent)

    // Create a FaqRetriever file in the fixtures directory
    const faqRetrieverPath = path.join(retrieversDir, 'faq.retriever.js')
    const faqRetrieverContent = `
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.TestFaqRetriever = void 0;
      const core_retrievers_1 = require("@langchain/core/retrievers");
      const core_documents_1 = require("@langchain/core/documents");

      class TestFaqRetriever extends core_retrievers_1.BaseRetriever {
        constructor() {
          super();
          this.faqs = [
            { question: 'What is LangChain?', answer: 'LangChain is a framework for developing applications powered by language models.' }
          ];
        }

        async getRelevantDocuments(query) {
          return this.faqs.map(faq => new core_documents_1.Document({
            pageContent: faq.answer,
            metadata: { question: faq.question, source: 'faq' }
          }));
        }
      }
      exports.TestFaqRetriever = TestFaqRetriever;
    `
    fs.writeFileSync(faqRetrieverPath, faqRetrieverContent)

    // Create a JSON runnable file
    const jsonRunnablePath = path.join(runnablesDir, 'test.runnable.json')
    const jsonRunnableContent = JSON.stringify(
      {
        type: 'tool',
        id: 'json-test-tool',
        name: 'JSON Test Tool',
        description: 'A test tool defined in JSON',
        config: {
          schema: {
            type: 'object',
            properties: {
              query: {type: 'string'},
            },
            required: ['query'],
          },
        },
      },
      null,
      2,
    )
    fs.writeFileSync(jsonRunnablePath, jsonRunnableContent)

    // Create a YAML runnable file
    const yamlRunnablePath = path.join(runnablesDir, 'test.runnable.yaml')
    const yamlRunnableContent = `
type: retriever
id: yaml-test-retriever
name: YAML Test Retriever
description: A test retriever defined in YAML
config:
  search_type: similarity
  search_kwargs:
    k: 5
`
    fs.writeFileSync(yamlRunnablePath, yamlRunnableContent)

    // Create the application and booter
    app = new Application()
    app.bind(BootBindings.PROJECT_ROOT).to(fixturesDir)

    // Create a mock instance of RunnableLoader
    class MockRunnableLoader extends RunnableLoader {
      load(options: any) {
        // Return the spec as is for testing
        return options.spec
      }
    }

    // Create an instance of the mock loader
    const mockRunnableLoader = new MockRunnableLoader(app)

    // Bind the mock loader
    app.bind(RUNNABLE_LOADER).to(mockRunnableLoader)

    booter = new LangChainBooter(app, fixturesDir)
  })

  afterEach(() => {
    // Clean up the fixtures directory
    if (fs.existsSync(toolsDir)) {
      fs.rmSync(toolsDir, {recursive: true, force: true})
    }
    if (fs.existsSync(retrieversDir)) {
      fs.rmSync(retrieversDir, {recursive: true, force: true})
    }

    // Clean up runnable files
    const jsonRunnablePath = path.join(runnablesDir, 'test.runnable.json')
    if (fs.existsSync(jsonRunnablePath)) {
      fs.unlinkSync(jsonRunnablePath)
    }

    const yamlRunnablePath = path.join(runnablesDir, 'test.runnable.yaml')
    if (fs.existsSync(yamlRunnablePath)) {
      fs.unlinkSync(yamlRunnablePath)
    }
  })

  it('should bind SearchTool when booted', async () => {
    // Configure the booter
    await booter.configure()

    // Discover artifacts
    await booter.discover()

    // Load artifacts
    await booter.load()

    // Check if tools are bound
    const bindings = app.findByTag({artifactType: 'tools'})
    expect(bindings).to.have.lengthOf(1)

    // Verify that the binding has the correct key pattern and tags
    const binding = bindings[0]
    expect(binding.key).to.match(/^langchain\.tools\.\d+$/)
    expect(binding.tagMap).to.have.property('artifactType', 'tools')

    // Verify that we can get a value from the binding
    const boundValue = await app.get(binding.key)
    expect(boundValue).to.not.be.undefined()
  })

  it('should bind FaqRetriever when booted', async () => {
    // Configure the booter
    await booter.configure()

    // Discover artifacts
    await booter.discover()

    // Load artifacts
    await booter.load()

    // Check if retrievers are bound
    const bindings = app.findByTag({artifactType: 'retrievers'})
    expect(bindings).to.have.lengthOf(1)

    // Verify that the binding has the correct key pattern and tags
    const binding = bindings[0]
    expect(binding.key).to.match(/^langchain\.retrievers\.\d+$/)
    expect(binding.tagMap).to.have.property('artifactType', 'retrievers')

    // Verify that we can get a value from the binding
    const boundValue = await app.get(binding.key)
    expect(boundValue).to.not.be.undefined()
  })

  it('should bind JSON runnable when booted', async () => {
    // Configure the booter
    await booter.configure()

    // Discover artifacts
    await booter.discover()

    // Load artifacts
    await booter.load()

    // Check if runnables are bound
    const bindings = app.findByTag({artifactType: 'runnable'})
    expect(bindings).to.have.lengthOf(2) // Both JSON and YAML runnables

    // Find the JSON runnable binding
    const jsonBinding = bindings.find(b => b.tagMap.name === 'JSON Test Tool')
    expect(jsonBinding).to.not.be.undefined()
    expect(jsonBinding?.key).to.equal('langchain.runnable.json-test-tool')
    expect(jsonBinding?.tagMap).to.have.property('artifactType', 'runnable')
    expect(jsonBinding?.tagMap).to.have.property('type', 'tool')

    // Verify that we can get a value from the binding
    const boundValue = await app.get(jsonBinding!.key)
    expect(boundValue).to.not.be.undefined()
    expect((boundValue as any).id).to.equal('json-test-tool')
    expect((boundValue as any).name).to.equal('JSON Test Tool')
  })

  it('should bind YAML runnable when booted', async () => {
    // Configure the booter
    await booter.configure()

    // Discover artifacts
    await booter.discover()

    // Load artifacts
    await booter.load()

    // Check if runnables are bound
    const bindings = app.findByTag({artifactType: 'runnable'})
    expect(bindings).to.have.lengthOf(2) // Both JSON and YAML runnables

    // Find the YAML runnable binding
    const yamlBinding = bindings.find(
      b => b.tagMap.name === 'YAML Test Retriever',
    )
    expect(yamlBinding).to.not.be.undefined()
    expect(yamlBinding?.key).to.equal('langchain.runnable.yaml-test-retriever')
    expect(yamlBinding?.tagMap).to.have.property('artifactType', 'runnable')
    expect(yamlBinding?.tagMap).to.have.property('type', 'retriever')

    // Verify that we can get a value from the binding
    const boundValue = await app.get(yamlBinding!.key)
    expect(boundValue).to.not.be.undefined()
    expect((boundValue as any).id).to.equal('yaml-test-retriever')
    expect((boundValue as any).name).to.equal('YAML Test Retriever')
  })
})
