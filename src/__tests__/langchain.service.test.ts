import {expect} from '@loopback/testlab';
import {
  LangChainService,
  LangChainOptions,
} from '../services/langchain.service';
import * as sinon from 'sinon';
import {ChatGroq} from '@langchain/groq';

describe('LangChainService', () => {
  let service: LangChainService;
  let chatGroqStub: sinon.SinonStub;
  let mockInvoke: sinon.SinonStub;

  beforeEach(() => {
    // Create mock response
    mockInvoke = sinon.stub();
    mockInvoke.resolves({content: 'Default mock response'});

    // Create a stub for ChatGroq constructor
    const mockChatModel = {invoke: mockInvoke};
    chatGroqStub = sinon.stub(ChatGroq.prototype, 'invoke');
    chatGroqStub.callsFake(mockInvoke);

    // Create service with test options
    const options: LangChainOptions = {
      apiKey: 'test-api-key',
      model: 'test-model',
      temperature: 0.5,
    };

    service = new LangChainService(options);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be initialized properly', () => {
    expect(service.isInitialized()).to.be.true();
    expect(service.getChatModel()).to.not.be.undefined();
  });

  it('should call invoke with the correct prompt', async () => {
    await service.generateText('Test prompt');
    expect(chatGroqStub.calledOnce).to.be.true();
    expect(chatGroqStub.calledWith('Test prompt')).to.be.true();
  });

  it('should return the content from the response', async () => {
    chatGroqStub.resolves({content: 'Custom response'});
    const result = await service.generateText('Hello');
    expect(result).to.equal('Custom response');
  });
});
