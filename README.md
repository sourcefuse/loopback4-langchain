# loopback4-langchain

A monorepo for Loopback 4 extension that integrates with LangChain, providing easy access to LLM capabilities in your Loopback applications.

## 📋 Overview

loopback4-langchain is an extension for [LoopBack 4](https://loopback.io/doc/en/lb4/) that integrates with [LangChain](https://js.langchain.com/docs/), a framework for developing applications powered by language models. This extension makes it easy to add AI capabilities to your Loopback applications.

### Key Features

- 🤖 Seamless integration with LangChain in Loopback 4 applications
- 🔌 Easy-to-use component architecture
- 🧩 Extensible tool system for custom LLM capabilities
- 🔄 Built-in support for Groq LLM provider
- 🛠️ TypeScript support for type safety

## 🧩 Project Structure

This repository is organized as a monorepo with the following structure:

```
loopback4-langchain/
├── packages/
│   └── loopback4-langchain/  # Main extension package
├── examples/
│   └── basic-ai-agent/       # Example application
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v7 or later)

### Installation

To use the extension in your Loopback 4 application:

```bash
npm install loopback4-langchain
```

### Basic Usage

1. Import the component in your application:

```typescript
import {LangChainComponent} from 'loopback4-langchain';

// In your application class:
this.component(LangChainComponent);
```

2. Configure the LangChain service (optional):

```typescript
import {LangChainBindings, LangChainOptions} from 'loopback4-langchain';

// In your application class:
const options: LangChainOptions = {
  apiKey: process.env.GROQ_API_KEY,  // Or provide directly
  model: 'llama3-8b-8192',           // Default model
  temperature: 0.7,                  // Default temperature
};
this.bind(LangChainBindings.LANGCHAIN_OPTIONS).to(options);
```

3. Inject and use the LangChain service in your controllers or services:

```typescript
import {inject} from '@loopback/core';
import {LangChainBindings} from 'loopback4-langchain';
import {LangChainService} from 'loopback4-langchain';

export class MyController {
  constructor(
    @inject(LangChainBindings.LANGCHAIN_SERVICE)
    private langChainService: LangChainService,
  ) {}

  async generateText(prompt: string) {
    const result = await this.langChainService.generateText(prompt);
    return result;
  }
}
```

### Creating Custom Tools

You can create custom tools to extend the capabilities of the LLM:

```typescript
import {asTool, Tool} from 'loopback4-langchain';
import {injectable, bind} from '@loopback/core';

@bind({tags: {[asTool]: true}})
@injectable()
export class WeatherTool implements Tool {
  name = 'get_weather';
  description = 'Get the current weather for a location';
  schema = {
    type: 'object',
    properties: {
      location: {type: 'string'},
    },
    required: ['location'],
  };

  async run(args: {location: string}): Promise<string> {
    // Implement weather lookup logic
    return `The weather in ${args.location} is sunny.`;
  }
}
```

## 🛠️ Development

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sourcefuse/loopback4-langchain.git
   cd loopback4-langchain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build all packages:
   ```bash
   npm run build
   ```

### Running the Example

1. Set up environment variables:
   ```bash
   # Create a .env file in examples/basic-ai-agent
   echo "GROQ_API_KEY=your_api_key_here" > examples/basic-ai-agent/.env
   ```

2. Start the example application:
   ```bash
   cd examples/basic-ai-agent
   npm start
   ```

3. Open your browser and navigate to http://localhost:3000

## 📚 API Documentation

### Components

- `LangChainComponent`: The main component that provides LangChain integration

### Services

- `LangChainService`: Service for interacting with LangChain
  - `generateText(prompt: string)`: Generate text using the LLM
  - `getChatModel()`: Get the underlying LangChain chat model

### Bindings

- `LangChainBindings.LANGCHAIN_SERVICE`: Binding key for the LangChain service
- `LangChainBindings.LANGCHAIN_OPTIONS`: Binding key for the LangChain options

### Extension Points

- `TOOL_EXTENSION_POINT_NAME`: Extension point for registering custom tools

## 🤝 Contributing

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## 📜 License

ISC
