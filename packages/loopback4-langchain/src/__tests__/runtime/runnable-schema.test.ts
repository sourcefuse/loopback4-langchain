import {describe, it, expect} from 'vitest'
import Ajv from 'ajv'
import * as fs from 'fs'
import * as path from 'path'

describe('Runnable Schema', () => {
  const schemaPath = path.resolve(
    __dirname,
    '../../runtime/runnable-schema.json',
  )
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
  const ajv = new Ajv({allErrors: true, allowUnionTypes: true})
  const validate = ajv.compile(schema)

  it('should be a valid JSON schema', () => {
    expect(schema.$schema).toBeDefined()
    expect(schema.type).toBe('object')
    expect(schema.properties).toBeDefined()
    expect(schema.properties.type).toBeDefined()
  })

  it('should validate a valid LLM runnable', () => {
    const llmRunnable = {
      type: 'llm',
      id: 'test-llm',
      name: 'Test LLM',
      description: 'A test LLM runnable',
      config: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 100,
      },
      lc: {
        type: 'langchain.llms.openai.OpenAI',
        id: ['langchain', 'llms', 'openai', 'OpenAI'],
      },
    }

    const valid = validate(llmRunnable)
    expect(valid).toBe(true)
    expect(validate.errors).toBeNull()
  })

  it('should validate a valid chat model runnable', () => {
    const chatModelRunnable = {
      type: 'chat_model',
      id: 'test-chat-model',
      name: 'Test Chat Model',
      description: 'A test chat model runnable',
      config: {
        model: 'gpt-4',
        temperature: 0.5,
        max_tokens: 200,
      },
      lc: {
        type: 'langchain.chat_models.openai.ChatOpenAI',
        id: ['langchain', 'chat_models', 'openai', 'ChatOpenAI'],
      },
    }

    const valid = validate(chatModelRunnable)
    expect(valid).toBe(true)
    expect(validate.errors).toBeNull()
  })

  it('should validate a valid tool runnable', () => {
    const toolRunnable = {
      type: 'tool',
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool runnable',
      config: {
        schema: {
          type: 'object',
          properties: {
            query: {type: 'string'},
          },
          required: ['query'],
        },
        func: 'searchFunction',
      },
      lc: {
        type: 'langchain.tools.base.Tool',
        id: ['langchain', 'tools', 'base', 'Tool'],
      },
    }

    const valid = validate(toolRunnable)
    expect(valid).toBe(true)
    expect(validate.errors).toBeNull()
  })

  it('should validate a valid chain runnable', () => {
    const chainRunnable = {
      type: 'chain',
      id: 'test-chain',
      name: 'Test Chain',
      description: 'A test chain runnable',
      config: {
        steps: [
          {
            id: 'step1',
            type: 'llm',
          },
          {
            id: 'step2',
            type: 'tool',
          },
        ],
      },
      lc: {
        type: 'langchain.chains.base.Chain',
        id: ['langchain', 'chains', 'base', 'Chain'],
      },
    }

    const valid = validate(chainRunnable)
    expect(valid).toBe(true)
    expect(validate.errors).toBeNull()
  })

  it('should validate a valid retriever runnable', () => {
    const retrieverRunnable = {
      type: 'retriever',
      id: 'test-retriever',
      name: 'Test Retriever',
      description: 'A test retriever runnable',
      config: {
        search_type: 'similarity',
        search_kwargs: {
          k: 5,
        },
      },
      lc: {
        type: 'langchain.retrievers.base.BaseRetriever',
        id: ['langchain', 'retrievers', 'base', 'BaseRetriever'],
      },
    }

    const valid = validate(retrieverRunnable)
    expect(valid).toBe(true)
    expect(validate.errors).toBeNull()
  })

  it('should reject an invalid runnable missing required type', () => {
    const invalidRunnable = {
      id: 'test-invalid',
      name: 'Test Invalid',
      description: 'An invalid runnable missing type',
    }

    const valid = validate(invalidRunnable)
    expect(valid).toBe(false)
    expect(validate.errors).not.toBeNull()
    expect(validate.errors?.[0].message).toContain(
      "must have required property 'type'",
    )
  })

  it('should reject an invalid runnable with unknown type', () => {
    const invalidRunnable = {
      type: 'unknown_type',
      id: 'test-invalid',
      name: 'Test Invalid',
      description: 'An invalid runnable with unknown type',
    }

    const valid = validate(invalidRunnable)
    expect(valid).toBe(false)
    expect(validate.errors).not.toBeNull()
    expect(validate.errors?.[0].message).toContain(
      'must be equal to one of the allowed values',
    )
  })
})
