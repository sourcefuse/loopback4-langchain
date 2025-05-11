import {lifeCycleObserver, LifeCycleObserver, inject} from '@loopback/core';
import {LANGCHAIN_SERVICE} from '../keys';
import {LangChainService} from '../services/langchain.service';

/**
 * This class will be bound to the application as a lifecycle observer
 * during the 'boot' phase.
 */
@lifeCycleObserver('langchain')
export class LangChainLifeCycleObserver implements LifeCycleObserver {
  constructor(
    @inject(LANGCHAIN_SERVICE) private langChainService: LangChainService,
  ) {}

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Check if the LangChain service is properly initialized
    if (!this.langChainService.isInitialized()) {
      console.warn('LangChain service is not properly initialized');
    } else {
      console.log('LangChain service is initialized and ready to use');
    }
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add any cleanup logic here
    console.log('LangChain service is shutting down');
  }
}