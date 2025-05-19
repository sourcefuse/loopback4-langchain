import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {LlmService} from '../services/llm.service';

export class BasicController {
  constructor(
    @inject('services.LlmService')
    private readonly llmService: LlmService,
  ) {}

  @get('/chat')
  async chat(@param.query.string('question') question: string) {
    return this.llmService.generateResponse(question);
  }

  // NOTE: please enable the system prompt in the application.ts file first
  // The system prompt is disabled by default or if it is missing in the LangChainOptions,
  // you can enable it by adding the systemPrompt property to the LangChainOptions.
  @get('/chat/joking-around-with-system-prompt')
  async chatWithSystemPrompt(@param.query.string('question') question: string) {
    return this.llmService.generateWithSystemPrompt(question);
  }

  @get('/chat/fitness-trainer')
  async chatWithFitnessTrainer(
    @param.query.string('heightInFeets', {required: true})
    heightInFeets: string,
    @param.query.string('weightInKgs', {required: true}) weightInKgs: string,
  ) {
    return this.llmService.generateFitnessTrainerResponse(
      heightInFeets,
      weightInKgs,
    );
  }

  @get('/tools')
  async tools() {
    return this.llmService.getTools();
  }

  @get('/tools/addition')
  async addition(
    @param.query.number('a', {required: true}) a: number,
    @param.query.number('b', {required: true}) b: number,
  ) {
    return this.llmService.useAdditionTool(a, b);
  }

  @get('/output-parsers')
  async outputParsers() {
    return this.llmService.getOutputParsers();
  }

  @get('/output-parsers/joke/json/{topic}')
  async jokeJson(@param.path.string('topic') topic: string) {
    return this.llmService.useJokeJsonOutputParser(topic);
  }

  @get('/output-parsers/top-10/custom-string-array/{topic}')
  async top10CustomStringArray(@param.path.string('topic') topic: string) {
    return this.llmService.useTop10CustomStringArrayOutputParser(topic);
  }
}
