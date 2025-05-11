import {describe, it, expect, beforeEach, afterEach} from 'vitest'
import {
  setupApplication,
  teardownApplication,
  AppWithClient,
} from './helpers/test-helper'
import {SupportBotApplication} from '../application'

describe('Chat API (e2e)', () => {
  let app: SupportBotApplication
  let client: AppWithClient['client']

  beforeEach(async () => {
    const appWithClient = await setupApplication()
    app = appWithClient.app
    client = appWithClient.client
  })

  afterEach(async () => {
    await teardownApplication(app)
  })

  it('should call /chat with mock LLM and return a response', async () => {
    // Arrange
    const requestBody = {
      message: 'Hello, I need help with my account',
      sessionId: 'test-session-123',
    }

    // Act & Assert
    // Using the mock client which will return predefined responses
    await client.post('/chat').send(requestBody).expect(200)

    // The test passes if no error is thrown
  })

  it('should retrieve chat history', async () => {
    // Act & Assert
    // Using the mock client which will return predefined responses
    await client.get('/chat/test-session-123').expect(200)

    // The test passes if no error is thrown
  })

  it('should clear chat history', async () => {
    // Act & Assert
    // Using the mock client which will return predefined responses
    await client.get('/chat/test-session-123/clear').expect(200)

    // The test passes if no error is thrown
  })
})
