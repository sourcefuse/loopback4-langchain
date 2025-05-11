import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {LangChainComponent, LangChainOptions} from 'loopback4-langchain';
import {MySequence} from './sequence';
import {RedisDataSource} from './datasources/redis.datasource';

export {ApplicationConfig};

// Create a binding key for LangChain options
const LANGCHAIN_OPTIONS = BindingKey.create<LangChainOptions>(
  'services.langchain.options',
);

export class BasicAiAgentApplication extends BootMixin(
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

    // Configure LangChain with Anthropic
    const anthropicOptions: LangChainOptions = {
      provider: 'anthropic',
      // Use a mock API key for testing
      apiKey: process.env.ANTHROPIC_API_KEY || 'mock-api-key-for-testing',
      model: 'claude-3-haiku-20240307',
      temperature: 0.7,
      systemPrompt:
        'You are an AI assistant that helps users with various tasks. You have access to tools that can perform specific functions. Use these tools when appropriate to provide the most helpful response.',
    };
    this.bind(LANGCHAIN_OPTIONS).to(anthropicOptions);

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
