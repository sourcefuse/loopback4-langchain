import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {
  LangChainComponent,
  LANGCHAIN_OPTIONS,
  LangChainOptions,
} from 'loopback4-langchain';
import {RedisDataSource} from './datasources/redis.datasource';

export {ApplicationConfig};

export class SupportBotApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // Register the Redis datasource
    this.dataSource(new RedisDataSource());

    // Configure LangChain with default options
    const langchainOptions: LangChainOptions = {
      provider: 'groq',
      // Use a mock API key for testing
      apiKey: process.env.GROQ_API_KEY || 'mock-api-key-for-testing',
      model: 'llama3-8b-8192',
      temperature: 0.7,
      systemPrompt:
        'You are a helpful support bot. Your goal is to assist users with their questions and problems in a friendly and professional manner. Provide clear, concise, and accurate information.',
    };
    this.bind(LANGCHAIN_OPTIONS).to(langchainOptions);

    // Register the LangChain component
    this.component(LangChainComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js', '.controller.ts'],
        nested: true,
      },
    };
  }
}
