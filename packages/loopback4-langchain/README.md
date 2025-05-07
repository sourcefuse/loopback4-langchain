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
    const result = await this.langChainService.query('Your prompt here');
    return result;
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

## API Documentation

### Components

- `LangChainComponent`: The main component that provides LangChain integration

### Bindings

- `LangChainBindings.LANGCHAIN_SERVICE`: Binding key for the LangChain service
- `LangChainBindings.CONFIG`: Binding key for the LangChain configuration

## License

ISC