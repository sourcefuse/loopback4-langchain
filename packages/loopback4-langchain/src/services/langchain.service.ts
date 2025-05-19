import {BindingScope, injectable} from '@loopback/core'
import {ChatGroq} from '@langchain/groq'
import {ChatAnthropic} from '@langchain/anthropic'
import {ChatOpenAI} from '@langchain/openai'
import {Tool} from 'langchain/tools'
import {BaseOutputParser} from '@langchain/core/output_parsers'
import {BaseChatModel} from '@langchain/core/language_models/chat_models'
import {SystemMessage, HumanMessage} from '@langchain/core/messages'

/**
 * LLM Provider types
 */
export type LLMProvider = 'groq' | 'anthropic' | 'openai'

/**
 * LangChain service options
 */
export interface LangChainOptions {
  apiKey?: string
  model?: string
  temperature?: number
  provider?: LLMProvider
  systemPrompt?: string
  baseUrl?: string
}

@injectable({scope: BindingScope.SINGLETON})
export class LangChainService {
  private chatModel: BaseChatModel

  private tools: Tool[] = []

  private outputParsers: BaseOutputParser[] = []

  private systemPrompt: string | undefined

  constructor(
    options: LangChainOptions = {},
    tools: Tool[] = [],
    outputParsers: BaseOutputParser[] = [],
  ) {
    // Store system prompt if provided
    this.systemPrompt = options.systemPrompt
    const provider = options.provider ?? 'groq'
    const temperature = options.temperature ?? 0.7

    if (provider === 'anthropic') {
      const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error(
          'Anthropic API key is required. Please provide it via options or set the ANTHROPIC_API_KEY environment variable.',
        )
      }
      // Default to Claude 3 Haiku model
      const modelName = options.model ?? 'claude-3-haiku-20240307'

      // Initialize Anthropic chat model
      this.chatModel = new ChatAnthropic({
        apiKey,
        modelName,
        temperature,
      })
    } else if (provider === 'openai') {
      const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error(
          'OpenAI API key is required. Please provide it via options or set the OPENAI_API_KEY environment variable.',
        )
      }
      // Default to GPT-3.5 Turbo model
      const modelName = options.model ?? 'gpt-3.5-turbo'

      // Initialize OpenAI chat model with optional baseUrl for local LLMs
      const openAIConfig: any = {
        apiKey,
        modelName,
        temperature,
      }

      // Add baseUrl if provided (for local LLMs)
      if (options.baseUrl) {
        openAIConfig.baseUrl = options.baseUrl
      }

      this.chatModel = new ChatOpenAI(openAIConfig)
    } else {
      // Default to Groq
      const apiKey = options.apiKey ?? process.env.GROQ_API_KEY
      if (!apiKey) {
        throw new Error(
          'Groq API key is required. Please provide it via options or set the GROQ_API_KEY environment variable.',
        )
      }
      // Default to Llama 3 8B model
      const modelName = options.model ?? 'llama3-8b-8192'

      // Initialize Groq chat model
      this.chatModel = new ChatGroq({
        apiKey,
        model: modelName,
        temperature,
      })
    }

    // Initialize tools
    if (
      tools.length > 0 &&
      this.chatModel &&
      typeof this.chatModel.bindTools === 'function'
    ) {
      this.chatModel.bindTools(tools)
      const toolsByName = Object.fromEntries(
        tools.map(tool => [tool.name, tool]),
      )
      this.tools = tools
    }

    // Store output parsers
    this.outputParsers = outputParsers
    const outputParsersByName = Object.fromEntries(
      outputParsers.map(parser => [parser.name, parser]),
    )
  }

  /**
   * Get the LangChain chat model instance
   */
  getChatModel(): BaseChatModel {
    return this.chatModel
  }

  /**
   * Get all registered tools
   */
  getTools(): Tool[] {
    return this.tools
  }

  /**
   * Get a tool by name
   * @param name Name of the tool
   */
  getToolByName(name: string): Tool {
    const found = this.tools.find(tool => tool.name === name)
    if (!found) {
      throw new Error(`Tool "${name}" not found`)
    }
    return found
  }

  /**
   * Get all registered output parsers
   */
  getOutputParsers(): BaseOutputParser[] {
    return this.outputParsers
  }

  /**
   * Get an output parser by name
   * @param name Name of the output parser
   */
  getOutputParserByName<T>(name: string): BaseOutputParser<T> {
    const found = this.outputParsers.find(parser => parser.name === name)
    if (!found) {
      throw new Error(`Output parser "${name}" not found`)
    }
    return found as BaseOutputParser<T>
  }

  /**
   * Generate text using the chat model
   * @param prompt Text prompt
   */
  async generateText(prompt: string): Promise<string> {
    // Create messages array
    const messages = []

    // Add system message if available
    if (this.systemPrompt) {
      messages.push(new SystemMessage(this.systemPrompt))
    }

    // Add user message
    messages.push(new HumanMessage(prompt))

    // Invoke the chat model with messages
    const response =
      messages.length > 1
        ? await this.chatModel.invoke(messages)
        : await this.chatModel.invoke(prompt)

    return response.content.toString()
  }

  /**
   * Generate text and parse the output
   * @param prompt Text prompt
   * @param parserName Name of the output parser to use
   */
  async generateAndParse(prompt: string, parserName: string): Promise<unknown> {
    const parser = this.getOutputParserByName(parserName)
    if (!parser) {
      throw new Error(`Output parser "${parserName}" not found`)
    }

    const text = await this.generateText(prompt)
    return parser.parse(text)
  }

  /**
   * Check if the LangChain service is properly initialized
   */
  isInitialized(): boolean {
    return !!this.chatModel
  }
}
