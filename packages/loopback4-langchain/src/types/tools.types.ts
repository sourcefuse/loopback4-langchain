import {BindingTemplate, extensionFor} from '@loopback/core'
import {Tool as LCToolType} from 'langchain/tools'

export interface Tool {
  name: string
  description: string
  schema: LCToolType['schema']
  run(args: unknown): Promise<unknown>
}

export const TOOL_EXTENSION_POINT_NAME = 'langchain.tools'

export const asTool: BindingTemplate = binding => {
  extensionFor(TOOL_EXTENSION_POINT_NAME)(binding)
  binding.tag({namespace: 'langchain.tools'})
}
