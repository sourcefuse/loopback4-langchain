import {extensionPoint, extensions} from '@loopback/core';
import {tool} from '@langchain/core/tools';
import {TOOL_EXTENSION_POINT_NAME} from '../types/tools.types';
import {Tool} from '../types/tools.types';
import {Tool as LCToolType} from 'langchain/tools';

export interface ToolExtensionPoint {
  tools: Tool[];
  getTools(): LCToolType[];
}

@extensionPoint(TOOL_EXTENSION_POINT_NAME)
export class ToolExtensionPointImpl implements ToolExtensionPoint {
  constructor(
    @extensions.list(TOOL_EXTENSION_POINT_NAME)
    public readonly tools: Tool[] = [],
  ) {}

  getTools(): LCToolType[] {
    return this.tools.map(({run, ...rest}) =>
      tool(run, {
        ...rest,
      }),
    );
  }
}
