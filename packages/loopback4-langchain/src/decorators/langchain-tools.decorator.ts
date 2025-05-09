import {ClassDecoratorFactory} from '@loopback/core';
import {asTool} from '../types/tools.types';

/**
 * Decorator for marking a class as a LangChain tool.
 * This decorator registers the class as an extension for the langchain.tools extension point.
 *
 * @example
 * ```ts
 * @langchainTools()
 * export class MyTool implements Tool {
 *   name = 'my-tool';
 *   description = 'A custom tool';
 *   schema = {
 *     type: 'object',
 *     properties: {
 *       input: {
 *         type: 'string',
 *       },
 *     },
 *     required: ['input'],
 *   };
 *
 *   async run(args: {input: string}): Promise<string> {
 *     return `Processed: ${args.input}`;
 *   }
 * }
 * ```
 */
export function langchainTools() {
  return ClassDecoratorFactory.createDecorator<object>('langchain.tools', asTool);
}