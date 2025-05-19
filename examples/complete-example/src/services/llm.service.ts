import {injectable, BindingScope, inject} from '@loopback/core';
import {
  Annotation,
  ChatPromptTemplate,
  HumanMessage,
  JsonOutputParser,
  LANGCHAIN_SERVICE,
  LangChainService,
  PromptTemplate,
  StateGraph,
} from 'loopback4-langchain';
import {z} from 'zod';
import {STRING_ARRAY_OUTPUT_PARSER} from '../langchain/output-parsers/string-array-list.output-parser';
import {ADDITION_TOOL} from '../langchain/tools/math.tool';

@injectable({scope: BindingScope.TRANSIENT})
export class LlmService {
  constructor(
    @inject(LANGCHAIN_SERVICE.key)
    private readonly langChainService: LangChainService,
  ) {}

  async generateResponse(question: string): Promise<string> {
    const llm = this.langChainService.getChatModel();
    const response = await llm.invoke([new HumanMessage(question)]);
    console.log('Response:', response);
    return response.content.toString();
  }

  async generateWithSystemPrompt(question: string): Promise<string> {
    return this.langChainService.generateText(question);
  }

  async generateFitnessTrainerResponse(
    heightInFeets: string,
    weightInKgs: string,
  ): Promise<string> {
    const llm = this.langChainService.getChatModel();
    const prompt = PromptTemplate.fromTemplate(
      'You are a fitness trainer. Based on the BMI ratio decide if the user need to gain or loss weight and create a workout plan for a person who is {heightInFeets} feet tall and weighs {weightInKgs} kgs.',
    );
    const messages = await prompt.format({heightInFeets, weightInKgs});
    const response = await llm.invoke([new HumanMessage(messages)]);
    console.log('Response:', response);
    return response.content.toString();
  }

  getTools() {
    const tools = this.langChainService.getTools();
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
    }));
  }

  getOutputParsers() {
    const outputParsers = this.langChainService.getOutputParsers();
    return outputParsers.map(outputParser => ({
      name: outputParser.name,
    }));
  }

  async useAdditionTool(a: number, b: number) {
    const additionTool = this.langChainService.getToolByName(ADDITION_TOOL);
    if (!additionTool) {
      throw new Error('Addition tool not found');
    }
    const result = await additionTool.invoke({a, b});
    return {result};
  }

  async useJokeJsonOutputParser(topic: string) {
    const llm = this.langChainService.getChatModel();

    // Define the format instructions used to prompt a language model
    const formatInstructions =
      'Return a JSON object with the following keys: setup and punchline.';

    // Set up a parser + inject instructions into the prompt template.
    type Joke = {
      setup: string;
      punchline: string;
    };
    const parser = new JsonOutputParser<Joke>();

    const prompt = ChatPromptTemplate.fromTemplate(
      'You are a comedian. Tell me a joke about {topic}. In the following format: {formatInstructions}',
    );
    const partialPrompt = await prompt.partial({
      formatInstructions,
    });

    // Create a chain that combines the prompt and the LLM
    // and the json output parser
    const chain = partialPrompt.pipe(llm).pipe(parser);

    const response = await chain.invoke({topic});
    return response;
  }

  async useTop10CustomStringArrayOutputParser(
    topic: string,
  ): Promise<string[]> {
    const llm = this.langChainService.getChatModel();

    // Get the custom output parser
    const stringArrayParser = this.langChainService.getOutputParserByName<
      string[]
    >(STRING_ARRAY_OUTPUT_PARSER);

    // Check if the format instructions are defined in the parser
    let formatInstructions = stringArrayParser?.getFormatInstructions();
    // or formatInstructions = 'Please provide an array of strings.';
    if (!formatInstructions) {
      formatInstructions =
        'Please provide an array of strings. For example: ["item1", "item2", "item3"].';
    }

    const prompt = ChatPromptTemplate.fromTemplate(
      'You are an expert assistant. Provide a list of the Top 10 most relevant or popular items based on the topic: {topic}. The topic can be anything (entities, people, movies, books, etc.). Respond strictly in the following format: {formatInstructions}',
    );
    const partialPrompt = await prompt.partial({
      formatInstructions,
    });

    // Create a chain that combines the prompt and the LLM
    // and the custom output parser
    const chain = partialPrompt.pipe(llm).pipe(stringArrayParser);

    const response = await chain.invoke({topic});
    return response;
  }

  async getJokeUsingPromptChaining(topic: string) {
    const llm = this.langChainService.getChatModel();

    // Graph state
    const StateAnnotation = Annotation.Root({
      topic: Annotation<string>,
      joke: Annotation<string>,
      improvedJoke: Annotation<string>,
      finalJoke: Annotation<string>,
    });

    // Define node functions

    // First LLM call to generate initial joke
    async function generateJoke(state: typeof StateAnnotation.State) {
      const msg = await llm.invoke(`Write a short joke about ${state.topic}`);
      return {joke: msg.content};
    }

    // Gate function to check if the joke has a punchline
    function checkPunchline(state: typeof StateAnnotation.State) {
      // Simple check - does the joke contain "?" or "!"
      if (state.joke?.includes('?') || state.joke?.includes('!')) {
        return 'Pass';
      }
      return 'Fail';
    }

    // Second LLM call to improve the joke
    async function improveJoke(state: typeof StateAnnotation.State) {
      const msg = await llm.invoke(
        `Make this joke funnier by adding wordplay: ${state.joke}`,
      );
      return {improvedJoke: msg.content};
    }

    // Third LLM call for final polish
    async function polishJoke(state: typeof StateAnnotation.State) {
      const msg = await llm.invoke(
        `Add a surprising twist to this joke: ${state.improvedJoke}`,
      );
      return {finalJoke: msg.content};
    }

    // Build workflow
    const chain = new StateGraph(StateAnnotation)
      .addNode('generateJoke', generateJoke)
      .addNode('improveJoke', improveJoke)
      .addNode('polishJoke', polishJoke)
      .addEdge('__start__', 'generateJoke')
      .addConditionalEdges('generateJoke', checkPunchline, {
        Pass: 'improveJoke',
        Fail: '__end__',
      })
      .addEdge('improveJoke', 'polishJoke')
      .addEdge('polishJoke', '__end__')
      .compile();

    // Invoke
    const state = await chain.invoke({topic});
    console.log('Initial joke:');
    console.log(state.joke);
    console.log('\n--- --- ---\n');
    if (state.improvedJoke !== undefined) {
      console.log('Improved joke:');
      console.log(state.improvedJoke);
      console.log('\n--- --- ---\n');

      console.log('Final joke:');
      console.log(state.finalJoke);
      return state;
    } else {
      console.log('Joke failed quality gate - no punchline detected!');
      return state;
    }
  }

  async getJokeUsingEvaluatorOptimizer(topic: string) {
    const llm = this.langChainService.getChatModel();

    // Graph state
    const StateAnnotation = Annotation.Root({
      joke: Annotation<string>,
      topic: Annotation<string>,
      feedback: Annotation<string>,
      funnyOrNot: Annotation<string>,
    });

    // Schema for structured output to use in evaluation
    const feedbackSchema = z.object({
      grade: z
        .enum(['funny', 'not funny'])
        .describe('Decide if the joke is funny or not.'),
      feedback: z
        .string()
        .describe(
          'If the joke is not funny, provide feedback on how to improve it.',
        ),
    });

    // Augment the LLM with schema for structured output
    const evaluator = llm.withStructuredOutput(feedbackSchema);

    // Nodes
    async function llmCallGenerator(state: typeof StateAnnotation.State) {
      // LLM generates a joke
      let msg;
      if (state.feedback) {
        msg = await llm.invoke(
          `Write a joke about ${state.topic} but take into account the feedback: ${state.feedback}`,
        );
      } else {
        msg = await llm.invoke(`Write a joke about ${state.topic}`);
      }
      return {joke: msg.content};
    }

    async function llmCallEvaluator(state: typeof StateAnnotation.State) {
      // LLM evaluates the joke
      const grade = await evaluator.invoke(`Grade the joke ${state.joke}`);
      return {funnyOrNot: grade.grade, feedback: grade.feedback};
    }

    // Conditional edge function to route back to joke generator or end based upon feedback from the evaluator
    function routeJoke(state: typeof StateAnnotation.State) {
      // Route back to joke generator or end based upon feedback from the evaluator
      if (state.funnyOrNot === 'funny') {
        return 'Accepted';
      } else {
        return 'Rejected + Feedback';
      }
    }

    // Build workflow
    const optimizerWorkflow = new StateGraph(StateAnnotation)
      .addNode('llmCallGenerator', llmCallGenerator)
      .addNode('llmCallEvaluator', llmCallEvaluator)
      .addEdge('__start__', 'llmCallGenerator')
      .addEdge('llmCallGenerator', 'llmCallEvaluator')
      .addConditionalEdges('llmCallEvaluator', routeJoke, {
        // Name returned by routeJoke : Name of next node to visit
        Accepted: '__end__',
        'Rejected + Feedback': 'llmCallGenerator',
      })
      .compile();

    // Invoke
    const state = await optimizerWorkflow.invoke({topic});
    return state;
  }
}
