import {Client, expect} from '@loopback/testlab';
import {BasicAiAgentApplication} from '../..';
import {setupApplication} from './test-helper';

describe('SupportController', () => {
  let app: BasicAiAgentApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET /support/info', async () => {
    const res = await client.get('/support/info').expect(200);
    expect(res.body).to.have.properties(['name', 'description', 'inputKeys', 'outputKeys']);
    expect(res.body.name).to.equal('SupportChain');
    expect(res.body.inputKeys).to.containEql('query');
    expect(res.body.outputKeys).to.containEql('result');
  });

  it('invokes GET /support/query with a query parameter', async () => {
    const res = await client
      .get('/support/query?query=How do I reset my password?')
      .expect(200);
    expect(res.body).to.have.property('result');
    expect(res.body.result).to.have.properties([
      'category',
      'priority',
      'summary',
      'response',
      'nextSteps',
    ]);
  });

  it('invokes POST /support with a query in the request body', async () => {
    const res = await client
      .post('/support')
      .send({query: 'I cannot access my account'})
      .expect(200);
    expect(res.body).to.have.property('result');
    expect(res.body.result).to.have.properties([
      'category',
      'priority',
      'summary',
      'response',
      'nextSteps',
    ]);
  });
});
