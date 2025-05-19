import {injectable} from '@loopback/core';
import {asOutputParser, OutputParser} from 'loopback4-langchain';

export const STRING_ARRAY_OUTPUT_PARSER = 'string-array-output-parser';

@injectable(asOutputParser)
export class StringArrayOutputParser implements OutputParser<string[]> {
  name = STRING_ARRAY_OUTPUT_PARSER;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  lc_namespace = ['output_parsers', 'custom-output_parser', 'string-array'];

  async parse(text: string): Promise<string[]> {
    return text
      .replace(/[\[\]"]/g, '') // Remove brackets and quotes
      .split(',') // Split the text by commas
      .map(item => item.trim()) // Trim whitespace from each item
      .filter(item => item.length > 0); // Filter out empty items
  }

  getFormatInstructions(): string {
    return `Please provide a comma-separated list of items. For example: item1, item2, item3. Do not include any other text`;
  }
}
