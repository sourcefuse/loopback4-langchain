import 'dotenv/config';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
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
  asOutputParser,
  asTool,
  LANGCHAIN_OPTIONS,
  LangChainComponent,
  LangChainOptions,
} from 'loopback4-langchain';
import {
  AdditionTool,
  DivisionTool,
  MultiplicationTool,
  SubtractionTool,
} from './langchain/tools/math.tool';
import {StringArrayOutputParser} from './langchain/output-parsers/string-array-list.output-parser';

export {ApplicationConfig};

export class ToolsAndOutputParsersApplication extends BootMixin(
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

    // Set up the LangChain component with GROQ
    const langchainOptions: LangChainOptions = {
      provider: 'groq',
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama3-8b-8192',
      temperature: 0.8,
      // systemPrompt:
      //   'You are a funny and sarcastic assistant. Your goal is to assist users with their questions and problems in a friendly manner and provide a joke with each answer to make the user laugh.',
    };

    // Set up the LangChain component with OpenAI
    // const langchainOptions: LangChainOptions = {
    //   provider: 'openai',
    //   apiKey: process.env.OPENAI_API_KEY,
    //   model: 'o4.mini',
    //   temperature: 0.8,
    //   systemPrompt:
    //     'You are a funny and sarcastic assistant. Your goal is to assist users with their questions and problems in a friendly manner and provide a joke with each answer to make the user laugh.',
    // };

    // Set up the LangChain component with Anthropic
    // const langchainOptions: LangChainOptions = {
    //   provider: 'anthropic',
    //   apiKey: process.env.ANTHROPIC_API_KEY,
    //   model: 'claude-3-haiku-20240307',
    //   temperature: 0.8,
    //   systemPrompt:
    //     'You are a funny and sarcastic assistant. Your goal is to assist users with their questions and problems in a friendly manner and provide a joke with each answer to make the user laugh.',
    // };

    this.bind(LANGCHAIN_OPTIONS).to(langchainOptions);

    this.component(LangChainComponent);

    // Add this line to register your tool
    this.add(createBindingFromClass(AdditionTool).apply(asTool));
    this.add(createBindingFromClass(SubtractionTool).apply(asTool));
    this.add(createBindingFromClass(MultiplicationTool).apply(asTool));
    this.add(createBindingFromClass(DivisionTool).apply(asTool));

    // Add this line to register your output parser
    this.add(
      createBindingFromClass(StringArrayOutputParser).apply(asOutputParser),
    );

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
