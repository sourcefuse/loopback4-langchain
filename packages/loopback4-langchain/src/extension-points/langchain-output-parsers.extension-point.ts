import {extensionPoint, extensions} from '@loopback/core'
import {BaseOutputParser} from '@langchain/core/output_parsers'
import {StructuredOutputParser} from 'langchain/output_parsers'
import {
  OUTPUT_PARSER_EXTENSION_POINT_NAME,
  OutputParser,
} from '../types/output-parser.types'

export interface OutputParserExtensionPoint {
  outputParsers: OutputParser[]
  getOutputParsers(): BaseOutputParser[]
}

@extensionPoint(OUTPUT_PARSER_EXTENSION_POINT_NAME)
export class OutputParserExtensionPointImpl
  implements OutputParserExtensionPoint
{
  constructor(
    @extensions.list(OUTPUT_PARSER_EXTENSION_POINT_NAME)
    public readonly outputParsers: OutputParser[] = [],
  ) {}

  getOutputParsers(): BaseOutputParser[] {
    return this.outputParsers.map(({parse, ...rest}) => {
      // Create a custom output parser that extends BaseOutputParser
      // Create a custom parser that implements the required methods
      const CustomParser = new (class extends BaseOutputParser {
        name = rest.name

        description = rest.description

        lc_namespace = ['langchain', 'output_parsers', 'custom']

        async parse(text: string): Promise<unknown> {
          return parse(text)
        }

        getFormatInstructions(): string {
          return ''
        }

        _type(): string {
          return 'custom_output_parser'
        }
      })()

      return CustomParser
    })
  }
}
