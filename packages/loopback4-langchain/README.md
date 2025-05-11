# loopback4-langchain

A Loopback 4 extension that integrates with LangChain, providing easy access to LLM capabilities in your Loopback applications.

## Installation

```sh
npm install loopback4-langchain
```

## Usage

### Basic Usage

1. Import the component in your application:

```typescript
import {LangChainComponent} from 'loopback4-langchain';

// In your application class:
this.component(LangChainComponent);
```

2. Inject the LangChain service in your controllers or services:

```typescript
import {inject} from '@loopback/core';
import {LangChainBindings} from 'loopback4-langchain';

export class MyController {
  constructor(
    @inject(LangChainBindings.LANGCHAIN_SERVICE)
    private langChainService: any,
  ) {}

  async someMethod() {
    const result = await this.langChainService.generateText('Your prompt here');
    return result;
  }

  async parseMethod() {
    // Using an output parser
    const parsedResult = await this.langChainService.generateAndParse(
      'Generate a JSON object with name and age fields',
      'json-parser' // Name of your registered output parser
    );
    return parsedResult;
  }
}
```

### Configuration

You can configure the LangChain component by binding configuration to the `LangChainBindings.CONFIG` binding key:

```typescript
import {LangChainBindings, LangChainConfig} from 'loopback4-langchain';

// In your application class:
const config: LangChainConfig = {
  // Your configuration here
};
this.bind(LangChainBindings.CONFIG).to(config);
```

## CLI Commands

The package includes a CLI tool that can be used to generate boilerplate code for your LangChain-enabled Loopback application.

### Installation

The CLI is automatically installed when you install the package. You can run it using:

```sh
npx lb4lc <command> [options]
```

### Available Commands

- `tool <name>`: Generate a new LangChain tool file in the `tools` directory.

Example:

```sh
npx lb4lc tool calculator
# Creates tools/calculator.tool.ts
```

- `prompt <name> [--system "..."]`: Generate a new prompt template file in the `prompts` directory.

Example:

```sh
npx lb4lc prompt userQuery --system "You are a helpful assistant."
# Creates prompts/userQuery.prompt.ts
```

- `system <name> --text="..."`: Generate a new system instruction file in the `systems` directory.

Example:

```sh
npx lb4lc system assistant --text="You are a helpful assistant that provides concise answers."
# Creates systems/assistant.system.ts
```

## API Documentation

### Components

- `LangChainComponent`: The main component that provides LangChain integration

### Services

- `LangChainService`: The main service that provides access to LangChain functionality

  Methods:
  - `getChatModel()`: Get the LangChain Groq chat model instance
  - `generateText(prompt: string)`: Generate text using the chat model
  - `getOutputParsers()`: Get all registered output parsers
  - `getOutputParserByName(name: string)`: Get an output parser by name
  - `generateAndParse(prompt: string, parserName: string)`: Generate text and parse the output using the specified parser
  - `isInitialized()`: Check if the LangChain service is properly initialized

### Bindings

- `LangChainBindings.LANGCHAIN_SERVICE`: Binding key for the LangChain service
- `LangChainBindings.CONFIG`: Binding key for the LangChain configuration
- `LangChainBindings.OUTPUT_PARSER`: Binding key for the output parser

### Decorators

- `@langchainTools()`: Decorator for marking a class as a LangChain tool. This decorator registers the class as an extension for the langchain.tools extension point.

Example:

```typescript
import {langchainTools, Tool} from 'loopback4-langchain';

@langchainTools()
export class MyTool implements Tool {
  name = 'my-tool';
  description = 'A custom tool';
  schema = {
    type: 'object',
    properties: {
      input: {
        type: 'string',
      },
    },
    required: ['input'],
  };

  async run(args: {input: string}): Promise<string> {
    return `Processed: ${args.input}`;
  }
}
```

- `@langchainOutputParsers()`: Decorator for marking a class as a LangChain output parser. This decorator registers the class as an extension for the langchain.output_parsers extension point.

Example:

```typescript
import {langchainOutputParsers, OutputParser} from 'loopback4-langchain';

@langchainOutputParsers()
export class JsonOutputParser implements OutputParser {
  name = 'json-parser';
  description = 'Parses JSON output from LLM';

  async parse(text: string): Promise<any> {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
}
```

## License

ISC
