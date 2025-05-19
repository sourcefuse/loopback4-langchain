/* eslint-disable max-classes-per-file, @typescript-eslint/no-unnecessary-type-constraint */
// TODO: Remove eslint-disable once the code is refactored
import {extensionPoint, extensions} from '@loopback/core'
import {BaseOutputParser} from '@langchain/core/output_parsers'
import {
  OUTPUT_PARSER_EXTENSION_POINT_NAME,
  OutputParser,
} from '../types/output-parser.types'

export interface OutputParserExtensionPoint<T extends unknown = unknown> {
  outputParsers: OutputParser<T>[]
  getOutputParsers(): BaseOutputParser[]
}

@extensionPoint(OUTPUT_PARSER_EXTENSION_POINT_NAME)
export class OutputParserExtensionPointImpl<T = unknown>
  implements OutputParserExtensionPoint
{
  constructor(
    @extensions.list(OUTPUT_PARSER_EXTENSION_POINT_NAME)
    public readonly outputParsers: OutputParser<T>[] = [],
  ) {}

  getOutputParsers(): BaseOutputParser[] {
    return this.outputParsers.map(({parse, getFormatInstructions, ...rest}) => {
      const CustomParser = new (class extends BaseOutputParser {
        name = rest.name

        // Use the user's lc_namespace if provided, otherwise use default
        lc_namespace = rest.lc_namespace ?? [
          'langchain',
          'output_parsers',
          'custom',
        ]

        async parse(
          ...args: Parameters<BaseOutputParser['parse']>
        ): Promise<T> {
          return parse(...args)
        }

        getFormatInstructions(): string {
          return getFormatInstructions?.() ?? ''
        }

        _type(): string {
          // Use custom _type if provided
          if (rest._type && typeof rest._type === 'function') {
            return rest._type()
          }
          return 'custom_output_parser'
        }
      })()

      // Copy any additional properties from the original parser
      Object.entries(rest).forEach(([key, value]) => {
        if (
          key !== 'name' &&
          key !== 'lc_namespace' &&
          key !== 'getFormatInstructions' &&
          key !== '_type'
        ) {
          ;(CustomParser as any)[key] = value
        }
      })

      return CustomParser
    })
  }
}
