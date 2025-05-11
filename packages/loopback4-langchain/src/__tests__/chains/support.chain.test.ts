import {describe, it, expect, beforeEach, vi} from 'vitest';
import {SupportChain} from '../../chains/support.chain';
import {BaseChatModel} from '@langchain/core/language_models/chat_models';

describe('SupportChain', () => {
  let supportChain: SupportChain;
  let mockChatModel: BaseChatModel;

  beforeEach(() => {
    // Create a mock chat model
    mockChatModel = {
      invoke: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          category: 'technical',
          priority: 'medium',
          summary: 'User is having trouble accessing their account',
          response:
            "I understand you're having trouble accessing your account. Let me help you with that.",
          nextSteps: [
            'Try resetting your password',
            'Check if your account is locked',
            'Contact support if the issue persists',
          ],
        }),
      }),
      // Add other required properties/methods
      _llmType: vi.fn().mockReturnValue('mock'),
      bind: vi.fn(),
      bindTools: vi.fn(),
      getNumTokens: vi.fn(),
      predictMessages: vi.fn(),
      serialize: vi.fn(),
    } as unknown as BaseChatModel;

    // Create the SupportChain instance
    supportChain = new SupportChain(mockChatModel);
  });

  it('should be defined', () => {
    expect(supportChain).toBeDefined();
  });

  it('should have the correct input keys', () => {
    expect(supportChain.inputKeys).toEqual(['query']);
  });

  it('should have the correct output keys', () => {
    expect(supportChain.outputKeys).toEqual(['result']);
  });

  it('should have the correct chain type', () => {
    expect(supportChain._chainType()).toEqual('support_chain');
  });

  it('should process a query and return a structured result', async () => {
    const query = 'I cannot access my account';
    const result = await supportChain.call({query});

    // Verify that the chat model was invoked
    expect(mockChatModel.invoke).toHaveBeenCalled();

    // Verify the result structure
    expect(result).toHaveProperty('result');
    expect(result.result).toHaveProperty('category', 'technical');
    expect(result.result).toHaveProperty('priority', 'medium');
    expect(result.result).toHaveProperty('summary');
    expect(result.result).toHaveProperty('response');
    expect(result.result).toHaveProperty('nextSteps');
    expect(Array.isArray(result.result.nextSteps)).toBe(true);
  });

  it('should use a custom template if provided', async () => {
    const customTemplate = 'Custom template: {query}';
    const customChain = new SupportChain(mockChatModel, {
      template: customTemplate,
    });

    const query = 'Test query';
    await customChain.call({query});

    // Verify that the chat model was invoked with the custom template
    const invokeArg = (mockChatModel.invoke as any).mock.calls[0][0];
    expect(invokeArg).toContain('Custom template: Test query');
  });

  it('should handle errors gracefully', async () => {
    // Mock the chat model to throw an error
    (mockChatModel.invoke as any).mockRejectedValue(new Error('Test error'));

    const query = 'Test query';

    // Expect the chain to throw an error
    await expect(supportChain.call({query})).rejects.toThrow();
  });
});
