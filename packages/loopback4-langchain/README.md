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
      'json-parser', // Name of your registered output parser
    );
    return parsedResult;
  }
}
```

### Configuration

You can configure the LangChain component by binding configuration to the `LangChainBindings.CONFIG` binding key:

```typescript
import {LangChainBindings, LangChainOptions} from 'loopback4-langchain';

// In your application class:
const langchainOptions: LangChainOptions = {
  // Choose a provider: 'groq', 'anthropic', or 'openai'
  provider: 'groq',

  // API key for the selected provider
  apiKey: process.env.GROQ_API_KEY,

  // Model name depends on the provider
  model: 'llama3-8b-8192',

  // Temperature for generation (0.0 to 1.0)
  temperature: 0.7,

  // Optional: System prompt for the chat model
  systemPrompt: 'You are a helpful assistant.',

  // Optional: Base URL for local LLM deployments (OpenAI-compatible APIs)
  // baseUrl: 'http://localhost:8080/v1',
};
this.bind('services.langchain.options').to(langchainOptions);
this.component(LangChainComponent);
```

#### Example Configurations

**Using OpenAI:**

```typescript
const langchainOptions: LangChainOptions = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant.',
};
```

**Using a Local LLM with OpenAI-compatible API:**

```typescript
const langchainOptions: LangChainOptions = {
  provider: 'openai',
  apiKey: 'not-needed-for-local-deployment', // Some local deployments don't require an API key
  model: 'local-model',
  baseUrl: 'http://localhost:8080/v1', // URL to your local LLM server
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant.',
};
```

## CLI Commands

The package includes a CLI tool that can be used to generate boilerplate code for your LangChain-enabled Loopback application.

### Installation

The CLI is automatically installed when you install the package. You can run it using:

```sh
npx lb4lc <command> [options]
```

### Available Commands

#### `tool <name>`

Generates a new LangChain tool file in the `tools` directory.

**Arguments:**
- `name`: Name of the tool (required)

**Example:**
```sh
npx lb4lc tool calculator
# Creates tools/calculator.tool.ts with a Tool class implementation
```

#### `prompt <name> [--system "..."]`

Generates a new prompt template file in the `prompts` directory.

**Arguments:**
- `name`: Name of the prompt (required)

**Options:**
- `--system`: System prompt to include in the template (optional)

**Example:**
```sh
npx lb4lc prompt userQuery --system "You are a helpful assistant."
# Creates prompts/userQuery.prompt.ts with the specified system prompt
```

#### `system <name> --text="..."`

Generates a new system instruction file in the `systems` directory.

**Arguments:**
- `name`: Name of the system instruction (required)

**Options:**
- `--text`: Text content for the system instruction (required)

**Example:**
```sh
npx lb4lc system assistant --text="You are a helpful assistant that provides concise answers."
# Creates systems/assistant.system.ts with the specified instruction
```

#### `retriever <name> [--datasource <DS>]`

Generates a new retriever file in the `retrievers` directory.

**Arguments:**
- `name`: Name of the retriever (required)

**Options:**
- `--datasource` or `-d`: Datasource to use for the retriever (optional)

**Example:**
```sh
npx lb4lc retriever faqRetriever --datasource redisDS
# Creates retrievers/faqRetriever.retriever.ts with Redis datasource configuration
```

#### `runnable <name> [--type <type>]`

Generates a new runnable JSON stub in the `configs/runnables` directory.

**Arguments:**
- `name`: Name of the runnable (required)

**Options:**
- `--type`: Type of runnable to generate (optional, default: 'chain')
  - Available types: 'llm', 'chat_model', 'tool', 'chain', 'retriever'

**Example:**
```sh
npx lb4lc runnable myChain
# Creates configs/runnables/mychain.json with a chain runnable stub

npx lb4lc runnable myLLM --type llm
# Creates configs/runnables/myllm.json with an LLM runnable stub
```

#### `chain <name> [--from <runnableName>]`

Generates a new chain class in the `chains` directory.

**Arguments:**
- `name`: Name of the chain (required)

**Options:**
- `--from`: Runnable name to use as source for the chain (optional)

**Example:**
```sh
npx lb4lc chain supportChain
# Creates chains/supportChain.chain.ts with a basic chain implementation

npx lb4lc chain supportChain --from mySupportRunnable
# Creates chains/supportChain.chain.ts based on the specified runnable
```

### CLI Help

To see the available commands and options, run:

```sh
npx lb4lc
```

## API Documentation

### Components

- `LangChainComponent`: The main component that provides LangChain integration

### Services

- `LangChainService`: The main service that provides access to LangChain functionality

  Methods:

  - `getChatModel()`: Get the LangChain chat model instance (supports Groq, Anthropic, or OpenAI)
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
