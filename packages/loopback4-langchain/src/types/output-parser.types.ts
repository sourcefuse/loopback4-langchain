import {Callbacks} from '@langchain/core/callbacks/manager'
import {BaseOutputParser} from '@langchain/core/output_parsers'
import {BindingTemplate, extensionFor} from '@loopback/core'

export interface OutputParser<T>
  extends Partial<
    Omit<
      BaseOutputParser,
      'name' | 'getFormatInstructions' | 'parse' | 'lc_namespace'
    >
  > {
  name: Exclude<BaseOutputParser['name'], undefined>
  getFormatInstructions?: BaseOutputParser['getFormatInstructions']
  parse: (text: string, callbacks?: Callbacks) => Promise<T>
  lc_namespace?: BaseOutputParser['lc_namespace']
}

export const OUTPUT_PARSER_EXTENSION_POINT_NAME = 'langchain.output_parsers'

export const asOutputParser: BindingTemplate = binding => {
  extensionFor(OUTPUT_PARSER_EXTENSION_POINT_NAME)(binding)
  binding.tag({namespace: OUTPUT_PARSER_EXTENSION_POINT_NAME})
}
