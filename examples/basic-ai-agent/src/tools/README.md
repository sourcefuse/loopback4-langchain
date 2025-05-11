# LangChain Tools Example

This directory contains examples of LangChain tools that can be used with the loopback4-langchain extension.

## Calculator Tool

The `CalculatorTool` is a simple example that demonstrates how to create a LangChain tool that can perform basic arithmetic operations.

### Usage

The tool is registered using the `@langchainTools()` decorator and implements the `Tool` interface from loopback4-langchain.

```typescript
@langchainTools()
export class CalculatorTool implements Tool {
  name = 'calculator';
  description = 'A calculator that can perform basic arithmetic operations';
  schema = {
    // Schema definition for the tool's input
  };

  async run(args: {operation: string; a: number; b: number}): Promise<string> {
    // Implementation of the tool's functionality
  }
}
```

## Tools Output Parser Example

The `ToolsExampleController` demonstrates how to use LangChain tools and output parsers:

1. **Direct Tool Execution**: Execute the calculator tool directly

   - Endpoint: `POST /tools/calculator`

2. **LLM Generation with Tools**: Generate a response using the LLM with the calculator tool

   - Endpoint: `GET /tools/generate?prompt=your_prompt_here`

3. **Structured Output Parsing**: Parse the output of the LLM response using a structured output parser

   - Endpoint: `POST /tools/parse`
   - Body: `{ "prompt": "your_prompt_here" }`

4. **Tools Information**: Get information about the available tools
   - Endpoint: `GET /tools/info`

### Example Requests

#### Execute Calculator Tool Directly

```bash
curl -X POST http://localhost:3000/tools/calculator \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "a": 5, "b": 3}'
```

#### Generate Response with Tools

```bash
curl "http://localhost:3000/tools/generate?prompt=What%20is%205%20plus%203?"
```

#### Parse Structured Output

```bash
curl -X POST http://localhost:3000/tools/parse \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Calculate 5 plus 3 and format the result"}'
```

#### Get Tools Information

```bash
curl http://localhost:3000/tools/info
```
