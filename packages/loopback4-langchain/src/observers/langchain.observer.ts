import {
  lifeCycleObserver,
  LifeCycleObserver,
  inject,
  Getter,
} from '@loopback/core'
import {LANGCHAIN_SERVICE} from '../keys'
import {LangChainService} from '../services/langchain.service'

/**
 * This class will be bound to the application as a lifecycle observer
 * during the 'boot' phase.
 */
@lifeCycleObserver('langchain')
export class LangChainLifeCycleObserver implements LifeCycleObserver {
  constructor(
    @inject.getter(LANGCHAIN_SERVICE)
    private langChainServiceGetter: Getter<LangChainService>,
  ) {}

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Resolve service AFTER application is fully started
    const langChainService = await this.langChainServiceGetter()

    if (!langChainService.isInitialized()) {
      console.warn('LangChain service is not properly initialized')
    } else {
      console.log('LangChain service is initialized and ready to use')
      // Log tools to verify they're available
      console.log('Available tools:', langChainService.getTools().length)
      console.log(
        'Available output parsers:',
        langChainService.getOutputParsers().length,
      )
    }
  }

  /**
   * This method will be invoked when the application stops.
   */
  stop() {
    // Add any cleanup logic here
    console.log('LangChain service is shutting down')
  }
}
