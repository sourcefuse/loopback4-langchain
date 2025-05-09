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
import {LangChainComponent, LANGCHAIN_OPTIONS, LangChainOptions} from 'loopback4-langchain';
import {RedisDataSource} from './datasources/redis.datasource';

export {ApplicationConfig};

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

    // Configure LangChain with Anthropic (uncomment to use)
    // const anthropicOptions: LangChainOptions = {
    //   provider: 'anthropic',
    //   apiKey: process.env.ANTHROPIC_API_KEY,
    //   model: 'claude-3-haiku-20240307',
    //   temperature: 0.7,
    // };
    // this.bind(LANGCHAIN_OPTIONS).to(anthropicOptions);

    // Register the LangChain component
    this.component(LangChainComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
