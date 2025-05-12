import {BootMixin} from '@loopback/boot'
import {ApplicationConfig, BindingKey} from '@loopback/core'
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer'
import {RepositoryMixin} from '@loopback/repository'
import {RestApplication} from '@loopback/rest'
import {ServiceMixin} from '@loopback/service-proxy'
import path from 'path'
import {LangChainComponent, LangChainOptions} from 'loopback4-langchain'
import {MySequence} from './sequence'
import {RedisDataSource} from './datasources/redis.datasource'

export {ApplicationConfig}

// Create a binding key for LangChain options
const LANGCHAIN_OPTIONS = BindingKey.create<LangChainOptions>(
  'services.langchain.options',
)

export class SupportBotApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options)

    // Set up the custom sequence
    this.sequence(MySequence)

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'))

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    })
    this.component(RestExplorerComponent)

    // Register the Redis datasource
    this.dataSource(new RedisDataSource())

    // Configure LangChain with default options
    const langchainOptions: LangChainOptions = {
      // You can choose between different providers: 'groq', 'anthropic', or 'openai'
      provider: 'openai',

      // API keys can be set via environment variables
      apiKey: 'mock-api-key-for-testing',

      // Model selection depends on the provider
      model: 'llama-3.2-1b-instruct',

      temperature: 0.7,
      baseUrl: 'http://127.0.0.1:1234/v1',
      systemPrompt:
        'You are a helpful support bot. Your goal is to assist users with their questions and problems in a friendly and professional manner. Provide clear, concise, and accurate information.',
    }

    // Add baseUrl only if it's defined in environment variables
    // This is for local LLM deployments (e.g., LocalAI, LM Studio, Ollama)
    if (process.env.LLM_BASE_URL && process.env.LLM_PROVIDER === 'openai') {
      ;(langchainOptions as any).baseUrl = process.env.LLM_BASE_URL
    }

    // Example configurations (commented out):

    // For OpenAI:
    // const langchainOptions: LangChainOptions = {
    //   provider: 'openai',
    //   apiKey: process.env.OPENAI_API_KEY,
    //   model: 'gpt-4',
    //   temperature: 0.7,
    //   systemPrompt: 'You are a helpful support bot...',
    // }

    // For local LLM with OpenAI-compatible API:
    // const langchainOptions: LangChainOptions = {
    //   provider: 'openai',
    //   apiKey: 'not-needed-for-local-deployment',
    //   model: 'local-model',
    //   baseUrl: 'http://localhost:8080/v1',
    //   temperature: 0.7,
    //   systemPrompt: 'You are a helpful support bot...',
    // }
    this.bind(LANGCHAIN_OPTIONS).to(langchainOptions)

    // Register the LangChain component
    this.component(LangChainComponent)

    this.projectRoot = __dirname
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js', '.controller.ts'],
        nested: true,
      },
    }
  }
}
