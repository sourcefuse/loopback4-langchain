import {ClassDecoratorFactory} from '@loopback/core';
import {asOutputParser} from '../types/output-parser.types';

/**
 * Decorator for marking a class as a LangChain output parser.
 * This decorator registers the class as an extension for the langchain.output_parsers extension point.
 *
 * @example
 * ```ts
 * @langchainOutputParsers()
 * export class MyOutputParser implements OutputParser {
 *   name = 'my-output-parser';
 *   description = 'A custom output parser';
 *
 *   async parse(text: string): Promise<any> {
 *     return JSON.parse(text);
 *   }
 * }
 * ```
 */
export function langchainOutputParsers() {
  return ClassDecoratorFactory.createDecorator<object>(
    'langchain.output_parsers',
    asOutputParser,
  );
}