import {injectable} from '@loopback/core';
import {asTool, langchainTools, ToolImpl} from 'loopback4-langchain';
import {z} from 'zod';

export const ADDITION_TOOL = 'addition-tool';
export const SUBTRACTION_TOOL = 'subtraction-tool';
export const MULTIPLICATION_TOOL = 'multiplication-tool';
export const DIVISION_TOOL = 'division-tool';

@langchainTools()
export class AdditionTool implements ToolImpl {
  name = ADDITION_TOOL;
  description =
    'Adds two numbers together. Use this tool when you need to perform addition.';
  schema = z.object({
    a: z.number().describe('The first number to add.'),
    b: z.number().describe('The second number to add.'),
  });

  async run(args: {a: number; b: number}): Promise<number> {
    return args.a + args.b;
  }
}

@injectable(asTool)
export class SubtractionTool implements ToolImpl {
  name = SUBTRACTION_TOOL;
  description =
    'Subtracts two numbers. Use this tool when you need to perform subtraction.';
  schema = z.object({
    a: z.number().describe('The first number to subtract from.'),
    b: z.number().describe('The second number to subtract.'),
  });

  async run(args: {a: number; b: number}): Promise<number> {
    return args.a - args.b;
  }
}

@injectable(asTool)
export class MultiplicationTool implements ToolImpl {
  name = MULTIPLICATION_TOOL;
  description =
    'Multiplies two numbers together. Use this tool when you need to perform multiplication.';
  schema = z.object({
    a: z.number().describe('The first number to multiply.'),
    b: z.number().describe('The second number to multiply.'),
  });

  async run(args: {a: number; b: number}): Promise<number> {
    return args.a * args.b;
  }
}

@injectable(asTool)
export class DivisionTool implements ToolImpl {
  name = DIVISION_TOOL;
  description =
    'Divides two numbers. Use this tool when you need to perform division.';
  schema = z.object({
    a: z.number().describe('The numerator.'),
    b: z.number().describe('The denominator.'),
  });

  async run(args: {a: number; b: number}): Promise<number> {
    if (args.b === 0) {
      throw new Error('Division by zero is not allowed.');
    }
    return args.a / args.b;
  }
}
