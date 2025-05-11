import {expect} from '@loopback/testlab';
import {Application, BindingScope} from '@loopback/core';
import {LangChainBooter} from '../booter';
import {BootBindings} from '@loopback/boot';
import path from 'path';
import fs from 'fs';
import {Tool} from '../types/tools.types';
import {z} from 'zod';
import {describe, it, beforeEach, afterEach} from 'vitest';

describe('LangChainBooter', () => {
  let app: Application;
  let booter: LangChainBooter;
  const fixturesDir = path.resolve(__dirname, './fixtures');
  const toolsDir = path.join(fixturesDir, 'tools');

  beforeEach(async () => {
    // Create fixtures directory if it doesn't exist
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir);
    }

    // Create tools directory if it doesn't exist
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir);
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
});
