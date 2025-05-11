import {expect} from '@loopback/testlab';
import {Application, BindingScope} from '@loopback/core';
import {LangChainBooter} from '../booter';
import {BootBindings} from '@loopback/boot';
import path from 'path';
import fs from 'fs';
import {Tool} from '../types/tools.types';
import {z} from 'zod';
import {describe, it, beforeEach, afterEach} from 'vitest';
import {FaqRetriever} from '../retrievers/faq-retriever';

describe('LangChainBooter', () => {
  let app: Application;
  let booter: LangChainBooter;
  const fixturesDir = path.resolve(__dirname, './fixtures');
  const toolsDir = path.join(fixturesDir, 'tools');
  const retrieversDir = path.join(fixturesDir, 'retrievers');

  beforeEach(async () => {
    // Create fixtures directory if it doesn't exist
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir);
    }

    // Create tools directory if it doesn't exist
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir);
    }

    // Create retrievers directory if it doesn't exist
    if (!fs.existsSync(retrieversDir)) {
      fs.mkdirSync(retrieversDir);
    }

    // Create a SearchTool file in the fixtures directory
    const searchToolPath = path.join(toolsDir, 'search.tool.js');
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
    `;
    fs.writeFileSync(searchToolPath, searchToolContent);

    // Create a FaqRetriever file in the fixtures directory
    const faqRetrieverPath = path.join(retrieversDir, 'faq.retriever.js');
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
    `;
    fs.writeFileSync(faqRetrieverPath, faqRetrieverContent);

    // Create the application and booter
    app = new Application();
    app.bind(BootBindings.PROJECT_ROOT).to(fixturesDir);
    booter = new LangChainBooter(app, fixturesDir);
  });

  afterEach(() => {
    // Clean up the fixtures directory
    if (fs.existsSync(toolsDir)) {
      fs.rmSync(toolsDir, {recursive: true, force: true});
    }
    if (fs.existsSync(retrieversDir)) {
      fs.rmSync(retrieversDir, {recursive: true, force: true});
    }
  });

  it('should bind SearchTool when booted', async () => {
    // Configure the booter
    await booter.configure();

    // Discover artifacts
    await booter.discover();

    // Load artifacts
    await booter.load();

    // Check if tools are bound
    const bindings = app.findByTag({artifactType: 'tools'});
    expect(bindings).to.have.lengthOf(1);

    // Verify that the binding has the correct key pattern and tags
    const binding = bindings[0];
    expect(binding.key).to.match(/^langchain\.tools\.\d+$/);
    expect(binding.tagMap).to.have.property('artifactType', 'tools');

    // Verify that we can get a value from the binding
    const boundValue = await app.get(binding.key);
    expect(boundValue).to.not.be.undefined();
  });

  it('should bind FaqRetriever when booted', async () => {
    // Configure the booter
    await booter.configure();

    // Discover artifacts
    await booter.discover();

    // Load artifacts
    await booter.load();

    // Check if retrievers are bound
    const bindings = app.findByTag({artifactType: 'retrievers'});
    expect(bindings).to.have.lengthOf(1);

    // Verify that the binding has the correct key pattern and tags
    const binding = bindings[0];
    expect(binding.key).to.match(/^langchain\.retrievers\.\d+$/);
    expect(binding.tagMap).to.have.property('artifactType', 'retrievers');

    // Verify that we can get a value from the binding
    const boundValue = await app.get(binding.key);
    expect(boundValue).to.not.be.undefined();
  });
});
