import {BindingTemplate, extensionFor} from '@loopback/core'
import {ZodTypeAny} from 'zod'

export interface ToolImpl {
  name: string
  description: string
  schema: ZodTypeAny
  run(args: unknown): Promise<unknown>
  returnType?: string
}

export const TOOL_EXTENSION_POINT_NAME = 'langchain.tools'

export const asTool: BindingTemplate = binding => {
  extensionFor(TOOL_EXTENSION_POINT_NAME)(binding)
  binding.tag({namespace: TOOL_EXTENSION_POINT_NAME})
}
