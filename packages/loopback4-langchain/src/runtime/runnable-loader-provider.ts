import {Context, inject, Provider} from '@loopback/core'
import { RunnableLoader } from './runnable-loader'


/**
 * Provider for RunnableLoader
 */
export class RunnableLoaderProvider implements Provider<RunnableLoader> {
  constructor(@inject.context() private context: Context) {}

  value(): RunnableLoader {
    return new RunnableLoader(this.context)
  }
}
