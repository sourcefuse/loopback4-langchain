import {BindingTemplate, extensionFor} from '@loopback/core';
import {BaseOutputParser} from '@langchain/core/output_parsers';

export interface OutputParser {
  name: string;
  description: string;
  parse(text: string): Promise<unknown>;
}

export const OUTPUT_PARSER_EXTENSION_POINT_NAME = 'langchain.output_parsers';

export const asOutputParser: BindingTemplate = binding => {
  extensionFor(OUTPUT_PARSER_EXTENSION_POINT_NAME)(binding);
  binding.tag({namespace: 'langchain.output_parsers'});
};
