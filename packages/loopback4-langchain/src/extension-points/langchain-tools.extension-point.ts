// eslint-disable
import {extensionPoint, extensions} from '@loopback/core'
import {tool} from '@langchain/core/tools'
import {Tool as LCToolType} from 'langchain/tools'
import {TOOL_EXTENSION_POINT_NAME, ToolImpl} from '../types/tools.types'

export interface ToolExtensionPoint {
  tools: ToolImpl[]
  getTools(): LCToolType[]
}

@extensionPoint(TOOL_EXTENSION_POINT_NAME)
export class ToolExtensionPointImpl implements ToolExtensionPoint {
  constructor(
    @extensions.list(TOOL_EXTENSION_POINT_NAME)
    public readonly tools: ToolImpl[] = [],
  ) {}

  getTools(): LCToolType[] {
    return this.tools.map(toolImpl =>
      tool(args => toolImpl.run(args), {
        name: toolImpl.name,
        description: toolImpl.description,
        schema: toolImpl.schema as any,
      }),
    )
  }
}
