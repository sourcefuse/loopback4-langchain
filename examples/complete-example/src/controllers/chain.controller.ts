import {api, get, param} from '@loopback/rest';
import {LlmService} from '../services';
import {inject} from '@loopback/core';

@api({basePath: '/chains'})
export class ChainController {
  constructor(
    @inject('services.LlmService')
    private readonly llmService: LlmService,
  ) {}

  @get('/joke-using-prompt-chaining')
  async getJoke(
    @param.query.string('topic', {required: true})
    topic: string,
  ) {
    return this.llmService.getJokeUsingPromptChaining(topic);
  }

  @get('/joke-using-evaluator-optimizer')
  async getJokeUsingEvaluatorOptimizer(
    @param.query.string('topic', {required: true})
    topic: string,
  ) {
    return this.llmService.getJokeUsingEvaluatorOptimizer(topic);
  }
}
