import {inject, Context, BindingScope, Provider} from '@loopback/core'
import * as fs from 'fs'
import * as path from 'path'
import Ajv from 'ajv'
import {Tool} from 'langchain/tools'
import {BaseOutputParser} from '@langchain/core/output_parsers'
import {BaseChatModel} from '@langchain/core/language_models/chat_models'
import {BaseRetriever} from '@langchain/core/retrievers'

/**
 * Type definition for a Runnable object
 */
export interface Runnable {
  type:
    | 'llm'
    | 'chat_model'
    | 'tool'
    | 'chain'
    | 'retriever'
    | 'output_parser'
    | 'prompt'
    | 'document_transformer'
  id: string
  name: string
  description?: string
  metadata?: Record<string, unknown>
  config?: Record<string, unknown>
  lc?: {
    type: string
    id: string | string[]
    kwargs?: Record<string, unknown>
  }
  instance?: any
}

/**
 * Options for the RunnableLoader
 */
export interface RunnableLoaderOptions {
  /**
   * Path to the specification file
   */
  specPath?: string

  /**
   * Specification object (alternative to specPath)
   */
  spec?: Runnable

  /**
   * Context for dependency injection
   */
  context?: Context
}

/**
 * A loader utility that loads a Runnable specification, resolves bindings via DI,
 * and returns a Runnable object.
 */
export class RunnableLoader {
  private ajv: Ajv

  private schema: Record<string, unknown>

  private context: Context

  constructor(@inject.context() context: Context) {
    this.context = context
    this.ajv = new Ajv({allErrors: true, allowUnionTypes: true})

    // Load the schema
    const schemaPath = path.resolve(__dirname, './runnable-schema.json')
    this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
  }

  /**
   * Load a Runnable from a specification
   * @param options Options for loading the Runnable
   * @returns The loaded Runnable object
   */
  async load(options: RunnableLoaderOptions): Promise<Runnable> {
    let spec: Runnable

    // Load the specification
    if (options.spec) {
      spec = options.spec
    } else if (options.specPath) {
      const specPath = path.resolve(options.specPath)
      if (!fs.existsSync(specPath)) {
        throw new Error(`Specification file not found: ${specPath}`)
      }
      spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
    } else {
      throw new Error('Either spec or specPath must be provided')
    }

    // Validate the specification against the schema
    const validate = this.ajv.compile(this.schema)
    const valid = validate(spec)
    if (!valid) {
      throw new Error(
        `Invalid Runnable specification: ${JSON.stringify(validate.errors)}`,
      )
    }

    // Resolve bindings based on the type of Runnable
    const resolvedRunnable = await this.resolveBindings(
      spec,
      options.context || this.context,
    )

    return resolvedRunnable
  }

  /**
   * Resolve bindings for a Runnable based on its type
   * @param spec The Runnable specification
   * @param context The context for dependency injection
   * @returns The Runnable with resolved bindings
   */
  private async resolveBindings(
    spec: Runnable,
    context: Context,
  ): Promise<Runnable> {
    // Create a copy of the spec to avoid modifying the original
    const resolvedSpec = {...spec}

    switch (spec.type) {
      case 'llm':
      case 'chat_model':
        // Resolve LLM or chat model bindings
        if (spec.config?.model) {
          try {
            const chatModelBindings = await context.findByTag({
              name: 'langchain.chat_model',
              model: spec.config.model,
            })
            if (chatModelBindings && chatModelBindings.length > 0) {
              const chatModel = await context.get<BaseChatModel>(
                chatModelBindings[0].key,
              )
              resolvedSpec.instance = chatModel
            }
          } catch (error) {
            // If no binding is found, continue with the spec as is
            console.warn(
              `No binding found for chat model: ${spec.config.model}`,
            )
          }
        }
        break

      case 'tool':
        // Resolve tool bindings
        try {
          const toolBindings = await context.findByTag({artifactType: 'tools'})
          for (const binding of toolBindings) {
            const tool = await context.get<Tool>(binding.key)
            if (tool.name === spec.name) {
              resolvedSpec.instance = tool
              break
            }
          }
        } catch (error) {
          // If no binding is found, continue with the spec as is
          console.warn(`No binding found for tool: ${spec.name}`)
        }
        break

      case 'retriever':
        // Resolve retriever bindings
        try {
          const retrieverBindings = await context.findByTag({
            artifactType: 'retrievers',
          })
          for (const binding of retrieverBindings) {
            const retriever = await context.get<BaseRetriever>(binding.key)
            if (retriever.constructor.name === spec.name) {
              resolvedSpec.instance = retriever
              break
            }
          }
        } catch (error) {
          // If no binding is found, continue with the spec as is
          console.warn(`No binding found for retriever: ${spec.name}`)
        }
        break

      case 'output_parser':
        // Resolve output parser bindings
        try {
          const parserBindings = await context.findByTag({
            artifactType: 'output_parsers',
          })
          for (const binding of parserBindings) {
            const parser = await context.get<BaseOutputParser>(binding.key)
            if (parser.name === spec.name) {
              resolvedSpec.instance = parser
              break
            }
          }
        } catch (error) {
          // If no binding is found, continue with the spec as is
          console.warn(`No binding found for output parser: ${spec.name}`)
        }
        break

      case 'chain':
        // Resolve chain bindings
        try {
          const chainBindings = await context.findByTag({
            artifactType: 'chains',
          })
          for (const binding of chainBindings) {
            const chain = await context.get(binding.key)
            if ((chain as any).constructor.name === spec.name) {
              resolvedSpec.instance = chain
              break
            }
          }
        } catch (error) {
          // If no binding is found, continue with the spec as is
          console.warn(`No binding found for chain: ${spec.name}`)
        }
        break

      case 'prompt':
        // Resolve prompt bindings
        try {
          const promptBindings = await context.findByTag({
            artifactType: 'prompts',
          })
          for (const binding of promptBindings) {
            const prompt = await context.get(binding.key)
            if ((prompt as any).constructor.name === spec.name) {
              resolvedSpec.instance = prompt
              break
            }
          }
        } catch (error) {
          // If no binding is found, continue with the spec as is
          console.warn(`No binding found for prompt: ${spec.name}`)
        }
        break

      default:
        // For other types, return the spec as is
        break
    }

    return resolvedSpec
  }
}

/**
 * Provider for RunnableLoader
 */
export class RunnableLoaderProvider implements Provider<RunnableLoader> {
  constructor(@inject.context() private context: Context) {}

  value(): RunnableLoader {
    return new RunnableLoader(this.context)
  }
}
