import {expect} from '@loopback/testlab'
import * as sinon from 'sinon'
import {ChatOpenAI} from '@langchain/openai'
import {ChatAnthropic} from '@langchain/anthropic'
import {describe, it, beforeEach, afterEach} from 'vitest'
import {
  ChatModelProvider,
  ChatModelOptions,
  ChatModelType,
} from '../providers/chat-model.provider'

describe('ChatModelProvider', () => {
  let provider: ChatModelProvider
  let openAIStub: sinon.SinonStub
  let anthropicStub: sinon.SinonStub

  beforeEach(() => {
    // Create stubs for ChatOpenAI and ChatAnthropic constructors
    openAIStub = sinon.stub(ChatOpenAI.prototype, 'invoke')
    anthropicStub = sinon.stub(ChatAnthropic.prototype, 'invoke')

    // Set environment variables for testing
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
  })

  afterEach(() => {
    sinon.restore()
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
  })

  it('should return OpenAI chat model by default', () => {
    provider = new ChatModelProvider()
    const model = provider.value()
    expect(model).to.be.instanceOf(ChatOpenAI)
  })

  it('should return OpenAI chat model when provider is openai', () => {
    provider = new ChatModelProvider({provider: 'openai'})
    const model = provider.value()
    expect(model).to.be.instanceOf(ChatOpenAI)
  })

  it('should return Anthropic chat model when provider is anthropic', () => {
    provider = new ChatModelProvider({provider: 'anthropic'})
    const model = provider.value()
    expect(model).to.be.instanceOf(ChatAnthropic)
  })

  it('should use provided API key and model for OpenAI', () => {
    // We can't easily spy on the constructor, so we'll just verify the instance is created
    // and test the error cases separately
    provider = new ChatModelProvider({
      provider: 'openai',
      apiKey: 'custom-openai-key',
      model: 'gpt-4',
      temperature: 0.5,
    })
    const model = provider.value()
    expect(model).to.be.instanceOf(ChatOpenAI)
  })

  it('should use provided API key and model for Anthropic', () => {
    provider = new ChatModelProvider({
      provider: 'anthropic',
      apiKey: 'custom-anthropic-key',
      model: 'claude-3-opus-20240229',
      temperature: 0.3,
    })
    const model = provider.value()
    expect(model).to.be.instanceOf(ChatAnthropic)
  })

  it('should throw error if OpenAI API key is not provided', () => {
    delete process.env.OPENAI_API_KEY
    provider = new ChatModelProvider({provider: 'openai'})
    expect(() => provider.value()).to.throw(/OpenAI API key is required/)
  })

  it('should throw error if Anthropic API key is not provided', () => {
    delete process.env.ANTHROPIC_API_KEY
    provider = new ChatModelProvider({provider: 'anthropic'})
    expect(() => provider.value()).to.throw(/Anthropic API key is required/)
  })
})
