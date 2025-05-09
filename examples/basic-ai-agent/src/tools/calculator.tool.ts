import {langchainTools, Tool} from 'loopback4-langchain';
import {z} from 'zod';

/**
 * A simple calculator tool that can perform basic arithmetic operations
 */
@langchainTools()
export class CalculatorTool implements Tool {
  name = 'calculator';
  description = 'A calculator that can perform basic arithmetic operations (add, subtract, multiply, divide)';
  schema = z.object({
    input: z.string().optional(),
  }).transform(input => input.input || "");

  async run(input: string): Promise<string> {
    try {
      // Parse the input string to extract operation, a, and b
      // Expected format: "operation: add, a: 5, b: 3" or similar
      const inputStr = input.trim();

      // Simple parsing logic - in a real app, you might want more robust parsing
      const operationMatch = inputStr.match(/operation:\s*(\w+)/i);
      const aMatch = inputStr.match(/a:\s*(-?\d+(\.\d+)?)/i);
      const bMatch = inputStr.match(/b:\s*(-?\d+(\.\d+)?)/i);

      if (!operationMatch || !aMatch || !bMatch) {
        return "Invalid input format. Please use format: 'operation: add, a: 5, b: 3'";
      }

      const operation = operationMatch[1].toLowerCase();
      const a = parseFloat(aMatch[1]);
      const b = parseFloat(bMatch[1]);

      if (isNaN(a) || isNaN(b)) {
        return "Invalid numbers provided";
      }

      let result: number;
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) {
            return 'Cannot divide by zero';
          }
          result = a / b;
          break;
        default:
          return `Unknown operation: ${operation}. Supported operations are: add, subtract, multiply, divide`;
      }

      return `Result of ${operation}(${a}, ${b}) = ${result}`;
    } catch (error) {
      return `Error processing calculation: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
